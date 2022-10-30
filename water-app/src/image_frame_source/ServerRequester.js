import $ from "jquery";

// TODO for server:
// - Enable Cross-Origin whatever for metadata (CORS missing allow-origin)
// - Enable the most recent date return for requests
// - Set data resolution to 1 minute
// - Add actual data sources

// TODO for frontend
// - XML parsing of data
// - better time selection
// - handling for discrete dates?
// - Parse and save metadata
// - Pass better params to loader

// TODO: this class is for testing and needs to be completed later on
class ServerRequester
{
    constructor() {
        // Server IP
        this.hostName = 'http://floviz.undo.it:6789/geoserver/floviz/wms';

        // Limit to the number of frames a user can request so that users don't create ridiculously sized requests
        this.maxImageCount = 250;

        // Image size
        this.imageWidth = 768;
        this.imageHeight = 761;

        // Image format
        this.imageFormat = 'image/jpeg';

        // XML parser for metadata
        this.parser = new DOMParser();

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

    // Function that makes a request to the server for the metadata, and returns the data as a list of objects
    fetchMetaDataFromServer() {
        return new Promise(async (resolve) => {
            // TODO cross origin CORS error
            let requestURL = `http://floviz.undo.it:6789/geoserver/floviz/wms?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS&`;
            let layerObjects = [];

            $.get(requestURL, function(data) {
               console.log(data.toString());

               // Parse data
               const xmlDoc = this.parser.parseFromString(data,"text/xml");

               // Parse out layers
               const layers = xmlDoc.getElementsByTagName('Layer');
               console.log('Layers: ' + layers.toString());

               for(const layer of layers) {
                   const name = layer.getElementsByTagName('Name')[0];
                   const title = layer.getElementsByTagName('Title')[0];
                   const srs = layer.getElementsByTagName('SRS')[0];
                   const bbox = layer.getElementsByTagName('LatLonBoundingBox')[0];
                   const times = layer.getElementsByTagName('Extent')[0];

                   const newLayerObject = {};
                   newLayerObject.name = name;
                   newLayerObject.title = title;
                   newLayerObject.srs = srs;
                   newLayerObject.bbox = bbox;
                   newLayerObject.times = times;

                   console.log('');
                   console.log(`Layer name: ${name}`);
                   console.log(`Title: ${title}`);
                   console.log(`SRS: ${srs}`);
                   console.log(`BBox: ${bbox}`);
                   console.log(`Times: ${times}`);

                   layerObjects.push(newLayerObject);
               }
            });

            // Simulate delay in server response
            await new Promise(resolve => { setTimeout(resolve, 1000)});

            let simulatedData = [
                {
                    id: 1,
                    overlay_name: 'Population Density by State',
                    start_date: new Date(Date.parse('01 Jan 2000 00:00:00 GMT')).toString(),
                    end_date: new Date(Date.parse('01 Jan 2005 00:00:00 GMT')).toString()
                },
                {
                    id: 2,
                    overlay_name: 'Radar Data',
                    start_date: new Date('01 Jan 2001 00:00:00 GMT').toString(),
                    end_date: new Date('01 Jan 2004 00:00:00 GMT').toString()
                }];

            resolve(simulatedData);

            // TODO: uncomment once parsing works
            // resolve(layerObjects);
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
        const layers = 'floviz:NDVI_data';
        const bbox = '73.3062744140625,28.96820068359375,77.5250244140625,33.14849853515625';
        const srs = 'EPSG%3A4326';

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