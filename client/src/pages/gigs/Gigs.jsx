import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation, useNavigate } from "react-router-dom";
import { CATEGORIES, getCategoryByValue } from "../../utils/constants";

function Gigs() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minRating, setMinRating] = useState(0);
  const minRef = useRef();
  const maxRef = useRef();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const searchQuery = params.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  const categories = Object.values(CATEGORIES);

  const deliveryTimes = [
    "24 Hours",
    "3 Days",
    "7 Days",
    "14 Days",
    "30 Days"
  ];

  const constructQueryString = () => {
    const params = new URLSearchParams();
    
    if (searchInput) params.set("search", searchInput);
    if (minRef.current?.value) params.set("min", minRef.current.value);
    if (maxRef.current?.value) params.set("max", maxRef.current.value);
    if (selectedCategory) params.set("cat", selectedCategory);
    if (deliveryTime) params.set("deliveryTime", deliveryTime);
    if (minRating) params.set("minRating", minRating);
    
    return params.toString();
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", searchInput, selectedCategory, deliveryTime, minRating],
    queryFn: () =>
      newRequest
        .get(`/gigs?${constructQueryString()}`)
        .then((res) => {
          return res.data;
        })
        .catch(err => {
          console.error("Error fetching gigs:", err);
          throw err;
        }),
  });

  useEffect(() => {
    refetch();
  }, [searchInput, selectedCategory, deliveryTime, minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryString = constructQueryString();
    navigate(`/gigs?${queryString}`);
    refetch();
  };

  const apply = () => {
    const queryString = constructQueryString();
    navigate(`/gigs?${queryString}`);
    refetch();
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">
          Skillhive {">"} {selectedCategory ? getCategoryByValue(selectedCategory)?.label || selectedCategory : "All Categories"}
        </span>
        <h1>Find the perfect service for your needs</h1>
        <p>
          Browse through thousands of professional services and find the perfect match for your project
        </p>
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for services..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <div className="filters">
          <div className="left">
            <div className="filter-group">
              <span>Category</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <span>Budget</span>
              <input ref={minRef} type="number" placeholder="min" />
              <input ref={maxRef} type="number" placeholder="max" />
            </div>
            <div className="filter-group">
              <span>Delivery Time</span>
              <select 
                value={deliveryTime} 
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option value="">Any Time</option>
                {deliveryTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <span>Minimum Rating</span>
              <select 
                value={minRating} 
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
            <button onClick={apply}>Apply Filters</button>
          </div>
        </div>
        <div className="cards">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">Something went wrong!</div>
          ) : data && data.length === 0 ? (
            <div className="no-results">
              <h3>No gigs found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            data?.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;
