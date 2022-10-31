import $ from "jquery";

// TODO for server:
// - Enable the most recent date return for requests
// - Set data resolution to 1 minute
// - Add actual data sources

// TODO for frontend
// - XML parsing of data
// - better time selection
// - handling for discrete dates?
// - Parse and save metadata
// - Pass better params to loader

class ServerRequester
{
    constructor() {
        // Server IP
        this.hostName = "http://floviz.undo.it:6789/geoserver/floviz/wms";

        // Limit to the number of frames a user can request so that users don"t create ridiculously sized requests
        this.maxImageCount = 250;

        // Image size
        this.imageWidth = 768;
        this.imageHeight = 761;

        // Image format
        this.imageFormat = "image/jpeg";

        // Bindings
        this.fetchMetaDataFromServer = this.fetchMetaDataFromServer.bind(this);
        this.getImageURLsFromSelection = this.getImageURLsFromSelection.bind(this);
    }

    // Helper to clean up URI creation
    static getURIWithParams(hostname, imageFormat, layers, srs, width, height, bbox, time) {
        let uri = "";
        uri = uri + `${encodeURIComponent(hostname)}?SERVICE=WMS`;
        uri = uri + `&VERSION=1.1.1`;
        uri = uri + `&REQUEST=GetMap`;
        uri = uri + `&FORMAT=${encodeURIComponent(imageFormat)}`;
        uri = uri + `&TRANSPARENT=true`;
        uri = uri + `&STYLES`;
        uri = uri + `&LAYERS=${encodeURIComponent(layers)}`;
        uri = uri + `&exceptions=application%2Fvnd.ogc.se_inimage`;
        uri = uri + `&SRS=${srs}`;
        uri = uri + `&WIDTH=${encodeURIComponent(width)}`;
        uri = uri + `&HEIGHT=${encodeURIComponent(height)}`;
        uri = uri + `&BBOX=${encodeURIComponent(bbox)}`;
        uri = uri + `&time=${encodeURIComponent(new Date(time).toISOString())}`;

        return uri;
    }

    static getInnerHTMLListFromHTMLCollection(collection) {
        let arr = [];
        for(const item of collection) {
            arr.push(item.innerHTML);
        }

        return arr;
    }

    static getFirstFromHTMLCollection(collection) {
        const arr = ServerRequester.getInnerHTMLListFromHTMLCollection(collection);

        try {
            return arr[0];
        } catch(err) {
            console.error(`Error in getFirstFromHTMLCollection: ${err}`);
            return {};
        }
    }

    static getAttributesFromHTMLCollection(collection) {
        let arr = [];
        for(const item of collection) {
            arr.push(item.attributes);
        }

        return arr;
    }

    // Returns an object with minx, maxx, miny, maxy fields that correspond to an attribute set for an object
    static getBoundingBoxFromHTMLCollection(collection) {
        const arr = ServerRequester.getAttributesFromHTMLCollection(collection);

        try {
            const attributes = arr[0];

            let bounds = {};
            bounds.minx = attributes.getNamedItem("minx").value;
            bounds.miny = attributes.getNamedItem("miny").value;
            bounds.maxx = attributes.getNamedItem("maxx").value;
            bounds.maxy = attributes.getNamedItem("maxy").value;

            return bounds;
        } catch(err) {
            console.error(`Error in getBoundingBoxFromHTMLCollection: ${err}`);
            return {};
        }
    }

    // Function that makes a request to the server for the metadata, and returns the data as a list of objects
    fetchMetaDataFromServer() {
        return new Promise(async (resolve, reject) => {
            let requestURL = `http://floviz.undo.it/geoserver/floviz/wms?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS&`;
            let layerObjects = [];

            try {
                await $.get(requestURL, function(data, status) {
                    // Parse XML elements
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data,"text/xml");

                    // Parse out layers
                    const layers = xmlDoc.getElementsByTagName("Layer");
                    for(const layer of layers) {
                        const name = ServerRequester.getFirstFromHTMLCollection(layer.getElementsByTagName("Name"));
                        let title = ServerRequester.getFirstFromHTMLCollection(layer.getElementsByTagName("Title"));
                        const srs = ServerRequester.getFirstFromHTMLCollection(layer.getElementsByTagName("SRS"));
                        const times = ServerRequester.getFirstFromHTMLCollection(layer.getElementsByTagName("Extent"));

                        // If the title doesn"t exist, use the layer name
                        if(title.length === 0)
                            title = name;

                        // Skip the one layer with all the data wrapped together
                        if(title.toString().indexOf("GeoServer") !== -1)
                            continue;

                        // Create the new object
                        const newLayerObject = {};
                        newLayerObject.overlay_name = name;
                        newLayerObject.title = title;
                        newLayerObject.srs = srs;
                        newLayerObject.raw_times = times;

                        // Load the bounding box. Bounding box can be stored in one of two fields. as properties instead of text.
                        // The purpose of this is to parse out the correct one to use in case one or the other doesn't exist
                        const latLonBoundingBoxProperties = ServerRequester.getBoundingBoxFromHTMLCollection(layer.getElementsByTagName("LatLonBoundingBox"));
                        const boundingBoxProperties = ServerRequester.getBoundingBoxFromHTMLCollection(layer.getElementsByTagName("BoundingBox"));

                        if(JSON.stringify(latLonBoundingBoxProperties).length > 0) {
                            newLayerObject.bbox_xmin = latLonBoundingBoxProperties.minx;
                            newLayerObject.bbox_xmax = latLonBoundingBoxProperties.maxx;
                            newLayerObject.bbox_ymin = latLonBoundingBoxProperties.miny;
                            newLayerObject.bbox_ymax = latLonBoundingBoxProperties.maxy;
                        } else if(JSON.stringify(boundingBoxProperties).length > 0) {
                            newLayerObject.bbox_xmin = boundingBoxProperties.minx;
                            newLayerObject.bbox_xmax = boundingBoxProperties.maxx;
                            newLayerObject.bbox_ymin = boundingBoxProperties.miny;
                            newLayerObject.bbox_ymax = boundingBoxProperties.maxy;
                        } else {
                            newLayerObject.bbox_xmin = 0.0;
                            newLayerObject.bbox_xmax = 0.0;
                            newLayerObject.bbox_ymin = 0.0;
                            newLayerObject.bbox_ymax = 0.0;
                        }

                        // Create a unique ID for the object
                        newLayerObject.id = layerObjects.length;

                        // Parse out start and end times
                        if(times !== undefined && times.toString().length > 0) {
                            const parsedTimes = times.toString().split(",");
                            newLayerObject.start_date = new Date(parsedTimes[0]).toString();
                            newLayerObject.end_date = new Date(parsedTimes[parsedTimes.length - 1]).toString();
                        } else {
                            // newLayerObject.start_date = "N/A";
                            // newLayerObject.end_date = "N/A";
                            continue;
                        }

                        layerObjects.push(newLayerObject);
                    }

                    resolve(layerObjects);
                });
            } catch(err) {
                console.log(`Error in metadata fetch: ${JSON.stringify(err)}`);
                resolve([]);
            }
        });
    }

    // Function that returns URLS to images based on an ID query. The MetaDataSidebar will post events
    // with the id number assigned to a row, and the purpose of this function is to return URLs of images
    // associated with those ids.
    getImageURLsFromSelection(ids, imageMetadata, intervalMS, startDate, endDate) {
        // TODO implement this once everything else works
        // // Calculate number of frames
        // const differenceMS = new Date(endDate).getTime() - new Date(startDate).getTime();
        // let frameCount = Math.floor(differenceMS / intervalMS);
        //
        // // Limit the number of frames returned
        // if(frameCount > this.maxImageCount) {
        //     console.log(`User requested ${frameCount} images, which is too many. Downsizing result to ${this.maxImageCount}`);
        //     frameCount = this.maxImageCount;
        // }
        //
        // let frameDateTimes = [];
        //
        // // Build dates of frames
        // for(let i = 0; i < frameCount; i++) {
        //     let intervalTime = (i * intervalMS) + new Date(startDate);
        //     frameDateTimes.push(intervalTime);
        // }
        //
        // // Build list of URLs
        let createdURLs = [];
        //
        // for(let i = 0; i < frameCount; i++) {
        //     const URL = `${this.hostName}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=${this.imageFormat}&TRANSPARENT=true&STYLES&LAYERS=${this.layer}&exceptions=application%2Fvnd.ogc.se_inimage&SRS=${this.srs}&WIDTH=${this.imageWidth}&HEIGHT=${this.imageHeight}&BBOX=${this.bbox}&time=${frameDateTimes[i]}`;
        //     createdURLs.push(URL);
        // }

        const validDates = [[8, 29], [9, 14], [9, 30]];
        const layers = "floviz:NDVI_data";
        const bbox = "73.3062744140625,28.96820068359375,77.5250244140625,33.14849853515625";
        const srs = "EPSG%3A4326";

        for(let i = 0; i < validDates.length; i++) {
            let pair = validDates[i];
            let time = `2021-${pair[0]}-${pair[1]}T00:00:00.000Z`;
            const uri = ServerRequester.getURIWithParams(this.hostName, this.imageFormat, layers, srs, this.imageWidth, this.imageHeight, bbox, time);

            createdURLs.push(uri);
        }

        return createdURLs;
    }
}

export default ServerRequester;