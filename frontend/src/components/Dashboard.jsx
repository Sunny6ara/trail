import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [course, setCourse] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/");

    axios
      .get("https://trail-xhnb.onrender.com/api/dashboard", {
        headers: { Authorization: token },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate("/"));
  }, []);

  const updateCourse = async () => {
    try {
      await axios.put(
        "https://trail-xhnb.onrender.com/api/update-course",
        { course },
        { headers: { Authorization: token } }
      );

      alert("Course Updated");
    } catch {
      alert("Error updating course");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Course: {user.course}</p>

      <input
        placeholder="New Course"
        onChange={(e) => setCourse(e.target.value)}
      />
      <button onClick={updateCourse}>Update Course</button>

      <br /><br />
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;