//import hook react
import React, { useEffect, useState, useRef } from "react";

//import react router dom
import { Link, useParams } from "react-router-dom";

//import layout web
import LayoutWeb from "../../../layouts/Web";

//import toats
import toast from "react-hot-toast";

//import BASE URL API
import Api from "../../../api";

//import imageGallery
import ImageGallery from "react-image-gallery";

//import js cookie
import Cookies from "js-cookie";

//import imageGallery CSS
import "react-image-gallery/styles/css/image-gallery.css";

//import mapbox gl
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { Rate, Button, Form, Input, Row, Col, Spin } from "antd";
import "antd/dist/antd.css";
//api key mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

const ImageSliderComponent = ({ place, images }) => {
  return (
    <>
      <h4>{place.title}</h4>
      <span className="card-text">
        <i className="fa fa-map-marker"></i> <i>{place.address}</i>
      </span>
      <hr />
      <ImageGallery items={images} autoPlay />
      <div dangerouslySetInnerHTML={{ __html: place.description }} />
    </>
  );
};

const ListCommentComponent = ({ comments }) => {
  return (
    <>
      {comments.map((q) => {
        return (
          <>
            <div>
              <section className="pb-3">
                <h6><b>{q.name}</b></h6>
                <div className="d-flex align-items-center">
                  <Rate style={{ fontSize: "15px", marginRight: "10px" }} defaultValue={q.star_rating}/>
                </div>
              </section>
                <p>{q.comments}</p>
            </div>
            <hr />
          </>
        );
      })}
    </>
  );
};

const ReviewComponent = ({ onSubmit }) => {
  return (
    <>
      <h5 className="mb-3 pt-5">
        <b>Review</b>
      </h5>
      <Form
        name="customized_form_controls"
        labelCol={{ span: 40 }}
        onFinish={(form) => onSubmit(form)}
      >
        {/* ===== section 1 ===== */}
        <Row className="w-100 d-flex justify-content-between">
          <Col span={11}>
            <Form.Item name="name">
              <Input placeholder="Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email">
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
        </Row>

        {/* ===== section 2 ===== */}
        <Row className="w-100 d-flex justify-content-between">
          <Col span={11}>
            <Form.Item name="phone">
              <Input placeholder="Phone" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="rate" label="Rate">
              <Rate />
            </Form.Item>
          </Col>
        </Row>

        {/* ===== section 3 ===== */}
        <Row className="w-100">
          <Form.Item name="comment" className="w-100">
            <Input.TextArea className="w-100" rows={10} placeholder="ReviewComments" />
          </Form.Item>
        </Row>

        {/* ===== section 4 ===== */}
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </>
  );
};

function WebPlaceShow() {
  //state place
  const [place, setPlace] = useState({});
  const [isLoad, setIsLoad] = useState(true);
  const [comments, setComments] = useState([]);

  const sendReview = async (formdata) => {
    //token
    const token = Cookies.get("token");

    //send data to server
    await Api.post(
      "/api/web/review-store",
      { ...formdata, place_id: place.id, rating: formdata.rate },
      {
        //header
        headers: {
          //header Bearer + Token
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        //show toast
        toast.success("Data Saved Successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        setComments([...comments, response.data]);
      })
      .catch((error) => {
        //set state "validation"
        toast.error("Failed!", {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      });
  };

  //map container
  const mapContainer = useRef(null);

  //slug params
  const { slug } = useParams();

  //function "fetchDataPlace"
  const fetchDataPlace = async () => {
    //fetching Rest API
    await Api.get(`/api/web/places/${slug}`).then((response) => {
      //set data to state "places"
      setPlace(response.data.data);
      setIsLoad(false);
      fetchComments(response.data.data.id);

      //set title from state "category"
      document.title = `${response.data.data.title} - CariMakan - Website Pencarian Lokasi Kuliner Terfavorit`;
    });
  };

  const fetchComments = async (id) => {
    await Api.get(`/api/web/review-store/comments/${id}`).then((response) => {
      console.log(setComments(response.data));
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
      zoom: 12,
    });

    //init popup
    new mapboxgl.Popup({
      closeOnClick: false,
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
                  <ImageSliderComponent images={images} place={place} />
                </div>
              </div>
              <div className="card border-0 rounded shadow-sm mt-4">
                <div className="card-body">
                  {isLoad ? (
                    <div className="d-flex justify-content-center align-items-center w-100">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <>
                      <h5 className="mb-4 mt-3"><b>Comment Section: </b></h5>
                      <hr />
                      <div style={{ height: "400px", overflow: "auto" }}>
                        <ListCommentComponent comments={comments} />
                      </div>
                      <hr />
                      <ReviewComponent onSubmit={sendReview} place={place} />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-5 mb-4">
              <div className="card border-0 rounded shadow-sm">
                <div className="card-body">
                  <h5>
                    <i className="fa fa-map-marked-alt"></i> MAPS
                  </h5>
                  <hr />
                  <div
                    ref={mapContainer}
                    className="map-container"
                    style={{ height: "350px" }}
                  />
                  <div className="d-grid gap-2">
                    <Link
                      to={`/places/${place.slug}/direction?longitude=${place.longitude}&latitude=${place.latitude}`}
                      className="float-end btn btn-success btn-block btn-md mt-3"
                    >
                      <i className="fa fa-location-arrow"></i> OPEN DIRECTION
                    </Link>
                  </div>
                </div>
                <hr />
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 col-2">
                      <div className="icon-info-green">
                        <i className="fa fa-map-marker-alt"></i>
                      </div>
                    </div>
                    <div className="col-md-10 col-10">
                      <div className="capt-info fw-bold">ADDRESS</div>
                      <div className="sub-title-info">
                        <i>{place.address}</i>
                      </div>
                    </div>
                    <div className="col-md-2 col-2">
                      <div className="icon-info-green">
                        <i className="fa fa-clock"></i>
                      </div>
                    </div>
                    <div className="col-md-10 col-10">
                      <div className="capt-info fw-bold">OFFICE HOURS</div>
                      <div className="sub-title-info">{place.office_hour}</div>
                    </div>
                    <div className="col-md-2 col-2">
                      <div className="icon-info-green">
                        <i className="fa fa-phone"></i>
                      </div>
                    </div>
                    <div className="col-md-10 col-10">
                      <div className="capt-info fw-bold">PHONE</div>
                      <div className="sub-title-info">{place.phone}</div>
                    </div>
                    <div className="col-md-2 col-2">
                      <div className="icon-info-green">
                        <i className="fa fa-globe-asia"></i>
                      </div>
                    </div>
                    <div className="col-md-10 col-10">
                      <div className="capt-info fw-bold">WEBSITE</div>
                      <div className="sub-title-info">
                        <a
                          href={place.website}
                          className="text-decoration-none"
                        >
                          {place.website}
                        </a>
                      </div>
                    </div>
                  </div>
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
