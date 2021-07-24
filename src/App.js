import React, {useEffect, useState, useCallback, useMemo} from "react";
import {Map, ScaleControl, ZoomControl} from 'react-bmapgl';
import { InfoHeader,InfoMarker,InfoWindow } from "./components";
import './styles/App.css';

function App() {
    const [timeRange, setTimeRange] = useState(6)
    const [data, setData] = useState({})
    const [focus, setFocus] = useState("")
    const [shouldAutoFocus, setShouldAutoFocus] = useState(true)
    const [bounds, setBounds] = useState(null)

    function onClickMarker(link){
        setShouldAutoFocus(true)
        if (focus == link) {
            setFocus("")
        } else {
            setFocus(link)
        }
    }

    useEffect(() => {
        console.log("enter page")
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (Object.keys(data).length === 0) {
            const serverData = JSON.parse(xhr.responseText)
            let pointDict = Object.assign({}, ...serverData.map(
                (serverDataEntry) => (
                    {
                        [serverDataEntry.link]: {
                            record: serverDataEntry,
                            // including different ways to create the latLong and time fields to make it compatible
                            // across different versions of json format; only for the transition phase
                            latLong: {
                                lng: (serverDataEntry.location && serverDataEntry.location.lng) || serverDataEntry.lng + Math.random() / 1000,
                                lat: (serverDataEntry.location && serverDataEntry.location.lat) || serverDataEntry.lat + Math.random() / 1000
                            },
                            time: serverDataEntry.Time || serverDataEntry.time
                        }
                    }
                    )));
                setData(pointDict);
            }
        };
        xhr.open("GET", "https://api-henan.tianshili.me/parse_json.json");
        xhr.send()
    }, [])

    let filterData = useMemo(() => {
        let currentFilteredData;
        console.log("update filter!")
        if (timeRange === 12) {
            currentFilteredData = data
        } else {
            const currentTimestamp = Date.now()
            currentFilteredData = Object.fromEntries(
                Object.entries(data).filter(
                    ([link, currentDataEntry]) =>
                        (currentTimestamp - Date.parse(currentDataEntry.time) < timeRange * 60 * 60 * 1000)
                )
            );
        }
        return currentFilteredData
    }, [data, timeRange])

    let handleSliderChange = (e) => {
        setTimeRange(e);
    }

    const mapRef = useCallback(node => {
        if (node !== null && bounds == null) {
            const map = node.map
            updateBounds('init', map)
            map.addEventListener('moveend', () => {
                updateBounds('moveend', map)
            })
            map.addEventListener('zoomend', () => {
                updateBounds('zoomend', map)
            })
        }
    }, []);

    let lastUpdateTime = Date.now()
    const updateBounds = (type, map) => {
        const offset = Date.now() - lastUpdateTime;
        // infowindow/autoviewport triggers move/zoom event
        // which leads infinite loop
        // prevent frequent refreshing
        if (offset < 500) return
        if (map == null) return

        lastUpdateTime = Date.now()

        const visibleBounds = map.getBounds()
        setShouldAutoFocus(false)
        setBounds(visibleBounds)
    }

    let infoMarkers = Object.entries(filterData).map(
        ([link, entry]) =>
            <InfoMarker key={entry.record.link} record={entry.record} latLong={entry.latLong} onClickMarker={onClickMarker}/>)

    return (
        <div className={"rootDiv"}>
            <InfoHeader list={Object.values(filterData).map(e => e.record)} bounds={bounds} notifySliderChange={handleSliderChange}/>

            <Map
                enableScrollWheelZoom={true}
                enableDragging={true}
                zoom={9}
                center={{lng: 113.802193, lat: 34.820333}}
                className="mapDiv"
                ref={mapRef}
                style={{height: "100%"}}>
                <ZoomControl/>
                <ScaleControl/>
                {infoMarkers}
                <InfoWindow item={filterData[focus]} shouldAutoCenter={shouldAutoFocus}/>
            </Map>
        </div>
    );
}

export default App;
