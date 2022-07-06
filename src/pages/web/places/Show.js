//import hook react
import React, { useEffect, useState, useRef } from "react";

//import react router dom
import { Link, useParams } from "react-router-dom";

//import layout web
import LayoutWeb from "../../../layouts/Web";

//import BASE URL API
import Api from "../../../api";

//import imageGallery
import ImageGallery from "react-image-gallery";

//import imageGallery CSS
import "react-image-gallery/styles/css/image-gallery.css";

//import mapbox gl
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

//api key mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

function WebPlaceShow() {

    //state place
    const [place, setPlace] = useState({});

    //map container
    const mapContainer = useRef(null);

    //slug params
    const { slug } = useParams();

    //function "fetchDataPlace"
    const fetchDataPlace = async () => {
        //fetching Rest API
        await Api.get(`/api/web/places/${slug}`)
        .then((response) => {

            //set data to state "places"
            setPlace(response.data.data);

            //set title from state "category"
            document.title = `${response.data.data.title} - CariMakan - Website Pencarian Lokasi Kuliner Terfavorit`;
        });
    };

    //hook
    useEffect(() => {
        //call function "fetchDataPlace"
        fetchDataPlace();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //=================================================================
    // react image gallery
    //=================================================================

    //define image array
    const images = [];

    //function "placeImages"
    const placeImages = () => {
        //loop data from object "place"
        for (let value in place.images) {
            //push to image array
            images.push({
                original: place.images[value].image,
                thumbnail: place.images[value].image,
            });
        }
    };

    //=================================================================
    // mapbox
    //=================================================================

    //function "initMap"
    const initMap = () => {
        //init Map
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [
                place.longitude ? place.longitude : "",
                place.latitude ? place.latitude : "",
            ],
            zoom: 15,
        });

        //init popup
        new mapboxgl.Popup({
                closeOnClick: false
            })
            .setLngLat([
                place.longitude ? place.longitude : "",
                place.latitude ? place.latitude : "",
            ])
            .setHTML(`<h6>${place.title}</h6><hr/><p><i>${place.address}</i></p>`)
            .addTo(map);
    };

    //hook 
    useEffect(() => {

        //call function "placeImage"
        placeImages();

        //call function "initMap"
        initMap();
    });

    return (
        <React.Fragment>
          <LayoutWeb>
            <div className="container mt-80">
              <div className="row">
                <div className="col-md-7 mb-4">
                  <div className="card border-0 rounded shadow-sm">
                    <div className="card-body">
                      <h4>{place.title}</h4>
                      <span className="card-text">
                        <i className="fa fa-map-marker"></i> <i>{place.address}</i>
                      </span>
                      <hr />
                      <ImageGallery items={images} autoPlay={true}/>
                      <div
                        dangerouslySetInnerHTML={{ __html: place.description }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LayoutWeb>
        </React.Fragment>
    );
}

export default WebPlaceShow;