"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Carousel from "../../components/Carousel";

const RecommendationsView = () => {
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get("/halls/recommendations");
        setHalls(response.data.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Halls</h2>
      <Carousel halls={halls} />
    </div>
  );
};

export default RecommendationsView;
