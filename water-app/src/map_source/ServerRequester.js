
// TODO: this class is for testing and needs to be completed later on
class ServerRequester
{
    constructor() {
        this.metaDataLoaded = false;
        this.metadata = [];

        // Bindings
        this.fetchMetaDataFromServer = this.fetchMetaDataFromServer.bind(this);
        // this.getImageURLsFromSelection = this.getImageURLsFromSelection.bind(this);
    }

    // Function that makes a request to the server for the metadata, and returns the data as a list of objects
    fetchMetaDataFromServer() {
        return new Promise(async (resolve, reject) => {
            // Simulate delay in server response
            await new Promise(resolve => { setTimeout(resolve, 1000)});

            let simulatedData = [
                {
                    id: 1,
                    overlay_name: 'Population Density by State',
                    start_date: new Date().toString(),
                    end_date: new Date().toString()
                },
                {
                    id: 2,
                    overlay_name: 'Radar Data',
                    start_date: new Date().toString(),
                    end_date: new Date().toString()
                }];

            resolve(simulatedData);
        });
    }

    // Function that returns URLS to images based on an ID query. The MetaDataSidebar will post events
    // with the id number assigned to a row, and the purpose of this function is to return URLs of images
    // associated with those ids.
    // TODO: how do we organize this
    // getImageURLsFromSelection(ids) {
    //
    // }

}

export default ServerRequester;