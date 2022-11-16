import $ from "jquery";

class ServerRequester
{
    constructor() {
        // Server IP
        this.hostName = "http://floviz.undo.it/geoserver/floviz/wms";

        // GeoServer namespace to use
        this.namespace = "floviz:";

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
    static getURIWithParams(hostname, imageFormat, namespace, layers, srs, width, height, bbox, time) {
        try {
            let uri = `${hostname.toString()}?SERVICE=WMS`;
            uri = uri + `&VERSION=1.1.1`;
            uri = uri + `&REQUEST=GetMap`;
            uri = uri + `&FORMAT=${encodeURIComponent(imageFormat.toString())}`;
            uri = uri + `&TRANSPARENT=true`;
            uri = uri + `&STYLES`;

            let layerNames = `&LAYERS=`;
            for(let layer of layers) {
                layerNames = layerNames + encodeURIComponent(`${namespace}` + layer.toString()) + ',';
            }
            layerNames = layerNames.slice(0, -1);
            uri = uri + layerNames;

            uri = uri + `&exceptions=application%2Fvnd.ogc.se_inimage`;
            uri = uri + `&SRS=${encodeURIComponent(srs)}`;
            uri = uri + `&WIDTH=${width.toString()}`;
            uri = uri + `&HEIGHT=${height.toString()}`;
            uri = uri + `&BBOX=${bbox.toString()}`;
            uri = time !== undefined ? uri + `&time=${new Date(time).toISOString()}` : uri;

            return uri;
        } catch(err) {
            console.error(`Error in getURIWithParams: ${err}`);
            return `https://via.placeholder.com/${width}x${height}.jpeg?text=Failed to load layer ${layer}`;
        }

    }

    // Helper function to return an array of the inner HTML of each object in an HTMLCollection
    static getInnerHTMLListFromHTMLCollection(collection) {
        let arr = [];
        for(const item of collection) {
            arr.push(item.innerHTML);
        }

        return arr;
    }

    // Helper to return the first object's inner HTML from an HTMLCollection
    static getFirstFromHTMLCollection(collection) {
        const arr = ServerRequester.getInnerHTMLListFromHTMLCollection(collection);

        try {
            return arr[0];
        } catch(err) {
            console.error(`Error in getFirstFromHTMLCollection: ${err}`);
            return {};
        }
    }

    // Helper function to return an array of the attributes of each object in an HTMLCollection
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
        return new Promise(async (resolve) => {
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

                        // If the title doesn't exist, use the layer name
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
                            newLayerObject.has_start_and_end = true;
                            newLayerObject.static = 'No';
                        } else {
                            newLayerObject.start_date = 'N/A';
                            newLayerObject.end_date = 'N/A';
                            newLayerObject.raw_times = '';
                            newLayerObject.has_start_and_end = false;
                            newLayerObject.static = 'Yes';
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
    getImageURLsFromSelection(ids, imageMetadata, intervalMultiplier, intervalPeriod, startDate, endDate, useStartAndEndDate, useAllDates, bboxXMin, bboxXMax, bboxYMin, bboxYMax) {
        // If using all frames, load them
        // Otherwise, we will load them as we parse the layers
        let frameDateTimes = [];

        if(!useAllDates) {
            let currentDate = new Date(startDate);
            const end = new Date(endDate);

            // Add the start date
            frameDateTimes.push(new Date(currentDate));

            // Create all dates before the end date
            while(currentDate.getTime() < end) {
                let newDate = currentDate;

                // Add the value to the correct field
                if(intervalPeriod === 0) {                                                  // Seconds
                    newDate.setSeconds(newDate.getSeconds() + intervalMultiplier);
                } else if(intervalPeriod === 1) {                                           // Minutes
                    newDate.setMinutes(newDate.getMinutes() + intervalMultiplier);
                } else if(intervalPeriod === 2) {                                           // Hours
                    newDate.setHours(newDate.getHours() + intervalMultiplier);
                } else if(intervalPeriod === 3) {                                           // Days
                    newDate.setDate(newDate.getDate() + intervalMultiplier);
                } else if(intervalPeriod === 4) {                                           // Weeks
                    newDate.setDate(newDate.getDate() + (7 * intervalMultiplier));
                } else if(intervalPeriod === 5) {                                           // Months
                    newDate.setMonth(newDate.getMonth() + intervalMultiplier);
                } else if(intervalPeriod === 6) {                                           // Years
                    newDate.setFullYear(newDate.getFullYear() + intervalMultiplier);
                } else {                                                                    // Error
                    console.error(`Invalid period in getImageURLsFromSelection: period=${intervalPeriod} multiplier=${intervalMultiplier}`);
                }

                // Push the date to the list
                frameDateTimes.push(new Date(newDate));

                // Update the current date
                currentDate = newDate;
            }

            // The last item in the array will always be greater than the end, so set the end as the last element
            frameDateTimes[frameDateTimes.length - 1] = end;
        }

        // Build the minimal bounding box shared between the selected layers
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

                    // If we are using all available times, load that from the layer
                    if(useAllDates && useStartAndEndDate) {
                        // Skip rows with no start and end
                        let rawTimes = layer.raw_times.split(',');
                        rawTimes.forEach((t) => {
                            try {
                                if(t !== 'N/A') {
                                    frameDateTimes.push(new Date(t).toISOString());
                                }
                            } catch (e) {
                                console.log(`Tried to parse invalid date using all dates: \"${t}\"`);
                            }
                        });
                    }
                }
            }
        }

        // Round the bounding box to 2 decimal places
        const xMin = Math.round((parseFloat(bboxXMin.toString()) + Number.EPSILON) * 100) / 100;
        const xMax = Math.round((parseFloat(bboxXMax.toString()) + Number.EPSILON) * 100) / 100;
        const yMin = Math.round((parseFloat(bboxYMin.toString()) + Number.EPSILON) * 100) / 100;
        const yMax = Math.round((parseFloat(bboxYMax.toString()) + Number.EPSILON) * 100) / 100;

        // Assert that every image selected uses the same SRS format
        let srsValid = true;
        for(let i = 0; i < layerNames.length; i++) {
            if(srsSpecs[i] !== srsSpecs[0])
                srsValid = false;
        }

        if(!srsValid) {
            console.log('Tried to combine layers with different SRS projection formats! Can\'t do that');
            return [`https://via.placeholder.com/${this.imageWidth}x${this.imageHeight}.jpeg?text=Bad request! Selected layers have different SRS projection formats`];
        }

        // Build list of URLs
        let createdObjects = [];
        const layerSRS = srsSpecs[0];

        if(useStartAndEndDate)
        {
            for(let j = 0; j < frameDateTimes.length; j++) {
                // Encode the bounding box
                const bbox = encodeURIComponent(`${xMin},${yMin},${xMax},${yMax}`);

                // Build the request
                const URL = ServerRequester.getURIWithParams(this.hostName, this.imageFormat, this.namespace, layerNames, layerSRS, this.imageWidth, this.imageHeight, bbox, frameDateTimes[j]);

                // Create the object
                let newObject = {};
                newObject.url = URL;
                newObject.timestamp = new Date(frameDateTimes[j]).toISOString();
                newObject.imageObject = new Image();
                newObject.imageObject.src = `https://via.placeholder.com/${this.imageWidth}x${this.imageHeight}.jpeg?text=Placeholder for ${URL}`;

                createdObjects.push(newObject);
            }
        }
        else
        {
            // Encode the bounding box
            const bbox = encodeURIComponent(`${xMin},${yMin},${xMax},${yMax}`);

            // Build the request
            const URL = ServerRequester.getURIWithParams(this.hostName, this.imageFormat, this.namespace, layerNames, layerSRS, this.imageWidth, this.imageHeight, bbox, undefined);

            // Create the object
            let newObject = {};
            newObject.url = URL;
            newObject.timestamp = '';
            newObject.imageObject = new Image();
            newObject.imageObject.src = `https://via.placeholder.com/${this.imageWidth}x${this.imageHeight}.jpeg?text=Placeholder for ${URL}`;

            createdObjects.push(newObject);
        }

        return createdObjects;
    }
}

export default ServerRequester;