//import hook from react
import React, { useEffect, useState, useRef } from "react";

//import layout web
import LayoutWeb from "../../../layouts/Web";

//import BASE URL API
import Api from "../../../api";

//import mapbox gl
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

//api key mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

function WebMapsIndex() {

    //title page
    document.title = "Maps - CariMakan - Website Pencarian Lokasi Kuliner Terfavorit";

    //map container
    const mapContainer = useRef(null);

    //state coordinate
    const [coordinates, setCoordinates] = useState([]);

    //function "fetchDataPlaces"
    const fetchDataPlaces = async () => {

        //fetching Rest API
        await Api.get('/api/web/all_places')
            .then((response) => {

                //set data to state
                setCoordinates(response.data.data)
            })
    }

    //hook
    useEffect(() => {

        //call function "fetchDataPlaces"
        fetchDataPlaces();

    }, []);

    //hook
    useEffect(() => {

        //init Map
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [106.816666, -6.200000],
            zoom: 10
        });

        //init geolocate
        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true
        });

        // Add geolocate control to the map.
        map.addControl(geolocate);

        // Create a default Marker and add it to the map.
        coordinates.forEach((location) => {

            // add popup
            const popup = new mapboxgl.Popup()
                .setHTML(`<h6>${location.title}</h6><hr/> <p>Category: ${location.category.map(q => q.name).join(", ")}</p><hr/> <p><i class="fa fa-map-marker"></i> <i>${location.address}</i></p><hr/><div class="d-grid gap-2"><a href="/places/${location.slug}" class="btn btn-sm btn-success btn-block text-white">Lihat Selengkapnya</a></div>`)
                .addTo(map);

            // add marker to map
            new mapboxgl.Marker()
                .setLngLat([location.longitude, location.latitude])
                .setPopup(popup)
                .addTo(map);
        });

    })

    return (
        <React.Fragment>
            <LayoutWeb>
                <div className="container mt-80">
                    <div className="row">
                        <div className="col-md-12 mb-5">
                            <div className="card border-0 rounded shadow-sm">
                              <div className="card-body"><h5><i className="fa fa-map-marked-alt"></i> SEMUA DATA VERSI MAPS</h5>
                                <hr />
                                <div ref={mapContainer} className="map-container" style={{ height: "450px" }} />
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LayoutWeb>
        </React.Fragment>
    )

}

export default WebMapsIndex;