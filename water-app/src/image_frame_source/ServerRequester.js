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
        this.hostName = "http://floviz.undo.it/geoserver/floviz/wms";

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
    static getURIWithParams(hostname, imageFormat, layer, srs, width, height, bbox, time) {
        let uri = "";
        uri = uri + `${hostname}?SERVICE=WMS`;
        uri = uri + `&VERSION=1.1.1`;
        uri = uri + `&REQUEST=GetMap`;
        uri = uri + `&FORMAT=${encodeURIComponent(imageFormat)}`;
        uri = uri + `&TRANSPARENT=true`;
        uri = uri + `&STYLES`;
        uri = uri + `&LAYERS=${encodeURIComponent(layer)}`;
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
                            newLayerObject.bbox_xmin = 'N/A';
                            newLayerObject.bbox_xmax = 'N/A';
                            newLayerObject.bbox_ymin = 'N/A';
                            newLayerObject.bbox_ymax = 'N/A';
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
        // Calculate number of frames
        const differenceMS = new Date(endDate).getTime() - new Date(startDate).getTime();
        let frameCount = Math.floor(differenceMS / intervalMS);

        // Limit the number of frames returned
        if(frameCount > this.maxImageCount) {
            console.log(`User requested ${frameCount} images, which is too many. Downsizing result to ${this.maxImageCount}`);
            frameCount = this.maxImageCount;
        } else {
            console.log(`Processing request for ${frameCount} frames`);
        }

        // Build dates of frames
        let frameDateTimes = [];
        for(let i = 0; i < frameCount; i++) {
            let intervalTime = new Date((i * intervalMS) + new Date(startDate).getTime());
            frameDateTimes.push(intervalTime);
        }

        // Build the minimal bounding box shared between the selected layers
        let xMin, xMax, yMin, yMax;
        let layerNames = [], srsSpecs = [];
        for(let i = 0; i < ids.length; i++) {
            let id = ids[i];

            for(let j = 0; j < imageMetadata.length; j++) {
                let layer = imageMetadata[j];

                if(layer.id === id) {
                    // Save the layer name
                    layerNames.push(layer.overlay_name);

                    // Save the SRS spec
                    srsSpecs.push(layer.srs);

                    // Update the bounds
                    if(i === 0) {
                        xMin = layer.bbox_xmin;
                        xMax = layer.bbox_xmax;
                        yMin = layer.bbox_ymin;
                        yMax = layer.bbox_ymax;
                    } else {
                        xMin = Math.max(xMin, layer.bbox_xmin);
                        xMax = Math.min(xMax, layer.bbox_xmax);
                        yMin = Math.max(yMin, layer.bbox_ymin);
                        yMax = Math.min(yMax, layer.bbox_ymax);
                    }
                }
            }
        }

        // Build list of URLs
        let createdURLs = [];
        for(let i = 0; i < layerNames.length; i++) {
            for(let j = 0; j < frameCount; j++) {
                const bbox = `${xMin},${yMin},${xMax},${yMax}`;
                const URL = ServerRequester.getURIWithParams(this.hostName, this.imageFormat, layerNames[i], layerNames[i], this.imageWidth, this.imageHeight, bbox, frameDateTimes[j]);
                createdURLs.push(URL);
            }

            // TODO: combine the frames here
        }

        console.log(createdURLs.join('\n'));

        return createdURLs;
    }
}

export default ServerRequester;