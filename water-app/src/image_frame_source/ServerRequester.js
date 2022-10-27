
// TODO: this class is for testing and needs to be completed later on
class ServerRequester
{
    constructor() {
        // Bindings
        this.fetchMetaDataFromServer = this.fetchMetaDataFromServer.bind(this);
        this.getImageURLsFromSelection = this.getImageURLsFromSelection.bind(this);
    }

    // Function that makes a request to the server for the metadata, and returns the data as a list of objects
    fetchMetaDataFromServer() {
        return new Promise(async (resolve) => {
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
    getImageURLsFromSelection(ids, imageMetadata, intervalMS) {
        let overlayNames = '';
        let newURLs = [];

        for(let i = 0; i < ids.length; i++) {
            const currentID = parseInt(ids.at(i));

            for(let j = 0; j < imageMetadata.length; j++) {
                const item = imageMetadata.at(j);

                if(item.id === currentID) {
                    overlayNames = overlayNames + `${item.overlay_name} - `
                }
            }
        }

        if(overlayNames.length > 0)
            overlayNames.slice(0, -3);

        for(let i = 0; i < 3; i++)
        {
            const newURL = `https://via.placeholder.com/960x720.jpeg?text=${overlayNames.replace(' ', '+')} ${i + 1}`;
            newURLs.push(newURL);
        }

        return newURLs;
    }
}

export default ServerRequester;