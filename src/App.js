import './App.css';
import {BaiduMap, Marker, InfoWindow, NavigationControl, GeolocationControl, MarkerClusterer } from 'react-baidu-maps';
import data from './parse_json.json'
import {useState} from "react";

function App() {
    const [timePreference, setTimePreference] = useState("see_all")
    const [timeRange, setTimeRange] = useState(8)

    const MAX = 5;
    const markerClusterer = [];
    for (let i = 0; i < MAX; i++) {
        markerClusterer.push({
            lng: (Math.random() * 40) + 85,
            lat: (Math.random() * 30) + 21
        });
    }

    let filterData = () => {
        var filtered_data = []
        if (timeRange == 12) {
            filtered_data = data
        } else {
            const currentTimestamp = Date.now()
            for (let i = 0 ; i < data.length ; ++i) {
                if (currentTimestamp - Date.parse(data[i]["Time"]) < timeRange * 60 * 60 * 1000) {
                    filtered_data.push(data[i])
                }
            }
        }
        return filtered_data.map(drawPoints)
    }

    let drawPoints = (record) => <Marker position={
        {lng: record["location"]["lng"] + Math.random()/1000, lat: record["location"]["lat"] + Math.random()/1000}
    }>
        <InfoWindow content={
            `
            <div>${record["post"]}</div>
            <div>原微博：<a target="_blank" rel="noopener noreferrer" href=${record["link"]}>${record["link"]}</a></div>
            <div>发布时间: 7月${record["Time"].substring(8,10)}日 ${record["Time"].substring(11, 20)}</div>
            `
        } offset={{width: 0, height: -20}}/>
    </Marker>

    let slider = () => {
        var labelText = "最近"+timeRange+"小时"
        if (timeRange == 12) {
            labelText = "全部记录"
        }
        return <label>
                    <input id="sliderRange" type="range" min="2" max="12" value={timeRange} onChange={handleSliderChange} step="2"/>
                    {labelText}
               </label>
    }

    let handleSliderChange = (e) => {
        setTimeRange(e.target.value)
    }

    return (
        <div className={"rootDiv"}>
            <div className="info">
                <div>本网站仅聚合新浪微博上发布的有关2021年7月河南暴雨的求助信息，请大家注意辨别信息真伪。点击标记点可以看到更多信息及原微博地址。</div>
                <br/>    
                {slider()}
            </div>

            <BaiduMap defaultZoom={9} defaultCenter={{lng:113.802193, lat:34.820333}} mapContainer={<div className={"mapDiv"}/>}>
                <MarkerClusterer>
                    {filterData()}
                </MarkerClusterer> 
                <NavigationControl
                    type="small"
                    anchor="top_right"
                    offset={{ width: 0, height: 30 }} />
                <GeolocationControl />
            </BaiduMap>
        </div>
    );
}

export default App;
