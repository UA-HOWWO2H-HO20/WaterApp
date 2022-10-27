import $ from "jquery";

// TODO: this class is for testing and needs to be completed later on
class ServerRequester
{
    constructor() {
        // Server IP
        this.hostName = 'http://floviz.undo.it:6789';

        // Limit to the number of frames a user can request so that users don't create ridiculously sized requests
        this.maxImageCount = 250;

        // Image size
        this.imageWidth = 768;
        this.imageHeight = 761;

        // Bounding box
        this.bbox = '73.884,29.541,76.945,32.575';

        // Other parameters
        this.srs = 'EPSG%3A4326';
        this.imageFormat = 'image%2Fjpeg';

        // move this shit andy
        this.layer = 'floviz:NVDI_data';
        this.time = '2021-09-14T00:00:00.000Z';

        // Bindings
        this.fetchMetaDataFromServer = this.fetchMetaDataFromServer.bind(this);
        this.getImageURLsFromSelection = this.getImageURLsFromSelection.bind(this);
    }

    // Function that makes a request to the server for the metadata, and returns the data as a list of objects
    fetchMetaDataFromServer() {
        return new Promise(async (resolve) => {
            // TODO cross origin CORS error
            // let requestURL = `http://floviz.undo.it:6789/geoserver/floviz/wms?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS&`;
            // $.get(requestURL, function(data) {
            //    console.log(data.toString());
            // });

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
        });
    }

    // Function that returns URLS to images based on an ID query. The MetaDataSidebar will post events
    // with the id number assigned to a row, and the purpose of this function is to return URLs of images
    // associated with those ids.
    // TODO: how do we organize this
    getImageURLsFromSelection(ids, imageMetadata, intervalMS, startDate, endDate) {
        // // Calculate number of frames
        // const differenceMS = new Date(endDate).getTime() - new Date(startDate).getTime();
        // let frameCount = Math.floor(differenceMS / intervalMS);
        //
        // // Limit the number of frames returned
        // if(frameCount > this.maxImageCount)
        // {
        //     console.log(`User requested ${frameCount} images, which is too many. Downsizing result to ${this.maxImageCount}`);
        //     frameCount = this.maxImageCount;
        // }

        let createdURLs = [];

        let validDates = [[8, 29], [9, 14], [9, 30]];

        for(let i = 0; i < validDates.length; i++)
        {
            let pair = validDates[i];
            const testURL = `http://floviz.undo.it:6789/geoserver/floviz/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=floviz%3ANDVI_data&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A4326&WIDTH=768&HEIGHT=761&BBOX=73.3062744140625%2C28.96820068359375%2C77.5250244140625%2C33.14849853515625&time=2021-${pair[0]}-${pair[1]}T00:00:00.000Z`

            createdURLs.push(testURL);
        }

        return createdURLs;
    }
}

export default ServerRequester;