//import react
import React, { useState, useEffect } from "react";

//import layout
import LayoutAdmin from "../../../layouts/Admin";

//import BASE URL API
import Api from "../../../api";

//import js cookie
import Cookies from "js-cookie";

//import Link from react router dom
// eslint-disable-next-line
import { Link } from "react-router-dom";

//import pagination component
import PaginationComponent from "../../../components/utilities/Pagination";

//import toats
import toast from "react-hot-toast";

//import react-confirm-alert
import { confirmAlert } from 'react-confirm-alert';

//import CSS react-confirm-alert
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css 

function ReviewRatingsIndex() {

    //title page
    document.title = "Review Ratings - Administrator CariMakan";

    //state posts
    const [reviewratings, setReviewratings] = useState([]);

    //state currentPage
    const [currentPage, setCurrentPage] = useState(1);

    //state perPage
    const [perPage, setPerPage] = useState(0);

    //state total
    const [total, setTotal] = useState(0);
    
    //token
    const token = Cookies.get("token");

    //state search
    const [search, setSearch] = useState("");

    //function "fetchData"
    const fetchData = async (pageNumber, searchData) => {

        //define variable "page"
        // eslint-disable-next-line
        const page = pageNumber ? pageNumber : currentPage; 

        //define variable "searchQuery"
        const searchQuery = searchData ? searchData : search;

        //fetching data from Rest API
        // eslint-disable-next-line
        await Api.get(`/api/admin/reviewratings?q=${searchQuery}&page=${page}`, { 
            headers: {
                //header Bearer + Token
                Authorization: `Bearer ${token}`,
            }
        }).then(response => {
            //set data response to state "sliders"
            setReviewratings(response.data.data.data);

            //set currentPage
            setCurrentPage(response.data.data.current_page);

            //set perPage
            setPerPage(response.data.data.per_page);

            //total
            setTotal(response.data.data.total);
        });
    };

    //hook
    useEffect(() => {
        //call function "fetchData"
        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //function "searchHandler"
    const searchHandlder = (e) => {
        e.preventDefault();
    
        //call function "fetchDataPost" with state search and page number
        fetchData(1, search)
    }

    //function "deleteReviewrating"
    const deleteReviewrating = (id) => {

        //show confirm alert
        confirmAlert({
            title: 'Are You Sure ?',
            message: 'want to delete this data ?',
            buttons: [{
                    label: 'YES',
                    onClick: async () => {
                        await Api.delete(`/api/admin/reviewratings/${id}`, {
                                headers: {
                                    //header Bearer + Token
                                    Authorization: `Bearer ${token}`,
                                }
                            })
                            .then(() => {

                                //show toast
                                toast.success("Data Deleted Successfully!", {
                                    duration: 4000,
                                    position: "top-right",
                                    style: {
                                        borderRadius: '10px',
                                        background: '#333',
                                        color: '#fff',
                                    },
                                });

                                //call function "fetchData"
                                fetchData();
                            })
                    }
                },
                {
                    label: 'NO',
                    onClick: () => {}
                }
            ]
        });
    }

    return (
        <React.Fragment>
            <LayoutAdmin>
                <div className="row mt-4">
                    <div className="col-md-12">
                        <div className="card border-0 border-top-success rounded shadow-sm mb-5">
                            <div className="card-header">
                                <span className="font-weight-bold"><i className="fa fa-comments"></i> Review Ratings</span>
                            </div>
                            <form onSubmit={searchHandlder} className="form-group">
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search by review ratings" />
                                    <button type="submit" className="btn btn-md btn-success"><i className="fa fa-search"></i> SEARCH</button>
                                </div>
                            </form>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped table-hovered">
                                        <thead>
                                        <tr>
                                            <th scope="col">No.</th>
                                            <th scope="col">Place</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">E-mail</th>
                                            <th scope="col">Star Ratings</th>
                                            <th scope="col">Comments</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {reviewratings.map((reviewrating, index) => (
                                                <tr key={index}>
                                                    <td className="text-center">{++index + (currentPage-1) * perPage}</td>
                                                    <td>{reviewrating.place.title}</td>
                                                    <td>{reviewrating.name}</td>
                                                    <td>{reviewrating.email}</td>
                                                    <td>{reviewrating.star_rating}</td>
                                                    <td>{reviewrating.comments}</td>
                                                    <td className="text-center">
                                                    <button onClick={() => deleteReviewrating(reviewrating.id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>
                                                    </td> 
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <PaginationComponent 
                                        currentPage={currentPage} 
                                        perPage={perPage} 
                                        total={total} 
                                        onChange={(pageNumber) => fetchData(pageNumber)}
                                        position="end"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LayoutAdmin>
        </React.Fragment>
    );

}

export default ReviewRatingsIndex