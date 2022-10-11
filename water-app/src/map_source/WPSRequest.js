import $ from 'jquery';

/** Classes to build requests to GeoServer in the WMS format. WMS uses XML syntax with tags
 *  to specify request parameters. Building requests manually can be clunky at best, so the
 *  goal for this file is to make that process a little easier.
 *
 */
class GSCapabilitiesRequest {
    // Requests the capabilities of the server and returns them in array format
    async getCapabilities(gsURL) {
        let url = `https://${gsURL}/geoserver/STORE/ows?service=wfs&version=2.0.0&request=GetCapabilities`;
        let layerList = [];

        await $.ajax({
            type: "GET",
            url: url,
            dataType: "xml",
            success: function(xml) {
                $(xml).find('FeatureType').each(function(){
                    let name = $(this).find("Name").text();
                    let title = $(this).find("Title").text();
                    let group = "NO_GROUP";
                    $(this).find('ows\\:Keywords').each(function(){
                        let keyword = $(this).find('ows\\:Keyword').text();
                        if(keyword.indexOf("group:") !== -1)
                        {
                            group=keyword.split(":")[1];
                            return false;
                        }
                    });
                    layerList.push({"name":name,"title":title,"group":group});
                });
            }
        });

        return layerList;
    }
}

class GSAnimationRequest {
    constructor() {
        // Fields to be set
        this.width = 800;
        this.height = 600;
        this.bbox = {
            lowerX: -180,
            lowerY: -90,
            upperX: 180,
            upperY: 90
        };
        this.fps = 1;
        this.startDate = new Date(0);
        this.endDate = new Date();
        this.period = {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        this.layer = '';
        this.outputFormat = 'image/GIF';
    }

    // Helper to create date range for animation
    // TODO: verify that this is correct
    buildTimeRange() {
        // Convert times to YYYY-MM-DDTHH:MM:SSZ format
        let startTime = this.startDate.toISOString();
        let endTime = this.endDate.toISOString();
        let period = `P${this.period.years}Y${this.period.months}M${this.period.days}DT${this.period.hours}H${this.period.minutes}M${this.period.seconds}S`;

        return `${startTime}/${endTime}/${period}`;
    }

    /** Compiles the resulting data to an XML-formatted string and returns it
     *
     */
    get() {
        return `<?xml version="1.0" encoding="UTF-8"?>
                <wps:Execute version="1.0.0" service="WPS"
                             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0"
                             xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0"
                             xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml"
                             xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1"
                             xmlns:xlink="http://www.w3.org/1999/xlink"
                             xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
                  <ows:Identifier>gs:DownloadAnimation</ows:Identifier>
                  <wps:DataInputs>
                    <wps:Input>
                      <ows:Identifier>bbox</ows:Identifier>
                      <wps:Data>
                        <wps:BoundingBoxData crs="EPSG:4326">
                          <ows:LowerCorner>${this.bbox.lowerX} ${this.bbox.lowerY}</ows:LowerCorner>
                          <ows:UpperCorner>${this.bbox.upperX} ${this.bbox.upperY}</ows:UpperCorner>
                        </wps:BoundingBoxData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>decoration</ows:Identifier>
                      <wps:Data>
                        <wps:LiteralData>formattedTimestamper</wps:LiteralData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>time</ows:Identifier>
                      <wps:Data>
                        <wps:LiteralData>${this.buildTimeRange()}</wps:LiteralData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>width</ows:Identifier>
                      <wps:Data>
                        <wps:LiteralData>${this.width}</wps:LiteralData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>height</ows:Identifier>
                      <wps:Data>
                        <wps:LiteralData>${this.height}</wps:LiteralData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>fps</ows:Identifier>
                      <wps:Data>
                        <wps:LiteralData>${this.fps}</wps:LiteralData>
                      </wps:Data>
                    </wps:Input>
                    <wps:Input>
                      <ows:Identifier>layer</ows:Identifier>
                      <wps:Data>
                        <wps:ComplexData xmlns:dwn="http://geoserver.org/wps/download">
                          <dwn:Layer>
                            <dwn:Name>${this.layer}</dwn:Name>
                          </dwn:Layer>
                        </wps:ComplexData>
                      </wps:Data>
                    </wps:Input>
                  </wps:DataInputs>
                  <wps:ResponseForm>
                    <wps:RawDataOutput mimeType="${this.outputFormat}">
                      <ows:Identifier>result</ows:Identifier>
                    </wps:RawDataOutput>
                  </wps:ResponseForm>
                </wps:Execute>`;
    }
}

export { GSAnimationRequest };