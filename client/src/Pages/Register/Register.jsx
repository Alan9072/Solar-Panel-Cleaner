import React, { useEffect, useState } from "react";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import { MdError } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";

const backendURL = "http://localhost:3000"; // Adjust the backend URL as needed

function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const [errmessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage("");

    // Check required fields
    if (!user.name || !user.username || !user.password ) {
      setErrMessage("Please fill out all required fields!");
      return;
    }

    // Convert numeric values correctly
    const userData = user

    console.log("Sending user data:", userData);

    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await axios.post(
          `${backendURL}/register`,
          userData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Response from /register API:", response.data.message);
        if (response.data.message !== "verified") {
          setErrMessage(response.data.message);
        } else {
          setUser({
            name: "",
            username: "",
            password: "",
          });

          navigate("/login");
        }
      } catch (error) {
        console.error("Error:", error);
        setErrMessage("There was an error creating your account.");
      } finally {
        setLoading(false);
      }
    }, 2000); // 3 seconds delay
  };


  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };


  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h1>Create an Account</h1>
        <p>Join us and enjoy all features.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputdiv}>
            <input type="text" name="name" placeholder="Full Name " value={user.name} onChange={handleChange} />
            <input type="text" name="username" placeholder="Username " value={user.username} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password " value={user.password} onChange={handleChange} />
          </div>

          <div className={styles.errDiv}>
            {errmessage && (
              <p className={styles.errMessage}>
                <MdError/>
                {errmessage}
              </p>
            )}
          </div>

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create Account"}
          </button>
        </form>

        <div className={styles.alreadyAcc}>
          <p>Already have an account?</p>
          <Link className={styles.loginRedirect} to="/login">
            <p>Login</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
