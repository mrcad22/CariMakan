//import hook from react
import React, { useState, useEffect, useRef } from "react";

//import layout
import LayoutAdmin from "../../../layouts/Admin";

//import BASE URL API
import Api from "../../../api";

//import hook history dari react router dom
import { useHistory, useParams } from "react-router-dom";

//import js cookie
import Cookies from "js-cookie";

//import toats
import toast from "react-hot-toast";

//import react Quill
import ReactQuill from "react-quill";

//import antd
import { Select, Spin } from "antd";
import "antd/dist/antd.css";

// quill CSS
import "react-quill/dist/quill.snow.css";

//mapbox gl
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

//mapbox gl geocoder
import MapboxGeocoder from "mapbox-gl-geocoder";

//api key mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

function PlaceEdit() {
  //title page
  document.title = "Edit Place - Administrator CariMakan";

  //state form
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [categoryID, setCategoryID] = useState([]);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [office_hour, setOfficeHour] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  //state image array / multiple
  const [images, setImages] = useState([]);

  //state categories
  const { Option } = Select;
  const children = [];

  for (let i = 10; i < 36; i++) {
    children.push(
      <Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>
    );
  }

  const handleChange = (value) => {
    setCategoryID(value);
  };

  const [categories, setCategories] = useState([]);

  //state validation
  const [validation, setValidation] = useState({});

  //token
  const token = Cookies.get("token");

  //history
  const history = useHistory();

  //get ID from parameter URL
  const { id } = useParams();

  //function "fetchCategories"
  const fetchCategories = async () => {
    //fetching data from Rest API
    return await Api.get("/api/web/categories").then((response) => {
      return response.data.data;
    });
  };

  //function "getPlaceById"
  const getPlaceById = async () => {
    //fetching data from Rest API
    return await Api.get(`/api/admin/places/${id}`, {
      headers: {
        //header Bearer + Token
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      //set data response to state

      return response.data.data;
    });
  };

  //function "handleFileChange"
  const handleFileChange = (e) => {
    //define variable for get value image data
    const imageData = e.target.files;

    Array.from(imageData).forEach((image) => {
      //check validation file
      if (!image.type.match("image.*")) {
        setImages([]);

        //show toast
        toast.error("Format File not Supported!", {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });

        return;
      } else {
        setImages([...e.target.files]);
      }
    });
  };

  //function "updatePlace"
  const updatePlace = async (e) => {
    e.preventDefault();

    //define formData
    const formData = new FormData();

    //append data to "formData"
    formData.append("title", title);
    formData.append("category_id", categoryID);
    formData.append("description", description);
    formData.append("phone", phone);
    formData.append("website", website);
    formData.append("office_hour", office_hour);
    formData.append("address", address);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("_method", "PATCH");

    Array.from(images).forEach((image) => {
      formData.append("image[]", image);
    });

    await Api.post(`/api/admin/places/${id}`, formData, {
      //header
      headers: {
        //header Bearer + Token
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        //show toast
        toast.success("Data Updated Successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });

        //redirect place index page
        history.push("/admin/places");
      })
      .catch((error) => {
        //set state "validation"
        setValidation(error.response.data);
      });
  };

  //=========================================================
  //MAPBOX
  //=========================================================

  //define state
  const mapContainer = useRef(null);
  const initMap = () => {
    //init map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [longitude, latitude],
      zoom: 15,
    });

    //init geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,

      marker: {
        draggable: true,
      },

      mapboxgl: mapboxgl,
    });

    map.addControl(geocoder);

    //init marker
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: "rgb(47 128 237)",
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    //geocoder result
    geocoder.on("result", function (e) {
      marker.remove();

      marker.setLngLat(e.result.center).addTo(map);

      marker.on("dragend", function (e) {
        setLatitude(e.target._lngLat.lat);
        setLongitude(e.target._lngLat.lng);
      });
    });
  };

  //hook
  useEffect(() => {
    setIsLoading(true);
    //call function "fetchCategories"
    fetchCategories().then((res) => {
      //set data response to state "catgeories"
      setCategories(res);
      getPlaceById().then((body) => {
        setTitle(body.title);
        setCategoryID(body.category.map((q) => q.id));
        setDescription(body.description);
        setPhone(body.phone);
        setWebsite(body.website);
        setOfficeHour(body.office_hour);
        setAddress(body.address);
        setLatitude(body.latitude);
        setLongitude(body.longitude);

        setIsLoading(false);
        initMap();
      });
    });

    //fetch function "getPlaceById"

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <>
        <LayoutAdmin>
          <div className="row mt-4 mb-4">
            <div className="col-12">
              <div className="card border-0 rounded shadow-sm border-top-success">
                <div className="card-header">
                  <span className="font-weight-bold">
                    <i className="fa fa-map-marked-alt"></i> EDIT PLACE
                  </span>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="d-flex w-100 justify-content-center align-items-center">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <form onSubmit={updatePlace}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Image (<i>select many file</i>)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter Title Place"
                        />
                      </div>
                      {validation.title && (
                        <div className="alert alert-danger">
                          {validation.title[0]}
                        </div>
                      )}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Category
                            </label>
                            <Select
                              mode="multiple"
                              allowClear
                              style={{
                                width: "100%",
                              }}
                              placeholder="Please select"
                              defaultValue={categoryID}
                              onChange={handleChange}
                            >
                              {categories.map((q) => {
                                return (
                                  <Option key={q.id} value={q.id}>
                                    {q.name}
                                  </Option>
                                );
                              })}
                            </Select>
                          </div>
                          {validation.category_id && (
                            <div className="alert alert-danger">
                              {validation.category_id[0]}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Office Hours
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={office_hour}
                              onChange={(e) => setOfficeHour(e.target.value)}
                              placeholder="Enter Office Hours"
                            />
                          </div>
                          {validation.office_hour && (
                            <div className="alert alert-danger">
                              {validation.office_hour[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Description
                        </label>
                        <ReactQuill
                          theme="snow"
                          rows="5"
                          value={description}
                          onChange={(content) => setDescription(content)}
                        />
                      </div>
                      {validation.description && (
                        <div className="alert alert-danger">
                          {validation.description[0]}
                        </div>
                      )}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Enter Phone"
                            />
                          </div>
                          {validation.phone && (
                            <div className="alert alert-danger">
                              {validation.phone[0]}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Website
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              placeholder="Enter Website Place"
                            />
                          </div>
                          {validation.website && (
                            <div className="alert alert-danger">
                              {validation.title[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Address</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter Address Place"
                        ></textarea>
                      </div>
                      {validation.address && (
                        <div className="alert alert-danger">
                          {validation.address[0]}
                        </div>
                      )}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Latitude
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={latitude}
                              onChange={(e) => setLatitude(e.target.value)}
                              placeholder="Enter Latitude Place"
                            />
                          </div>
                          {validation.latitude && (
                            <div className="alert alert-danger">
                              {validation.latitude[0]}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Longitude
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={longitude}
                              onChange={(e) => setLongitude(e.target.value)}
                              placeholder="Enter Longitude Place"
                            />
                          </div>
                          {validation.longitude && (
                            <div className="alert alert-danger">
                              {validation.longitude[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div ref={mapContainer} className="map-container" />
                        </div>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="btn btn-md btn-success me-2"
                        >
                          <i className="fa fa-save"></i> UPDATE
                        </button>
                        <button type="reset" className="btn btn-md btn-warning">
                          <i className="fa fa-redo"></i> RESET
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </LayoutAdmin>
      </>
    </React.Fragment>
  );
}

export default PlaceEdit;
