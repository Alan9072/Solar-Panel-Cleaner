import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { MdError } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";

const backendURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function Login() {
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
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage("");

    if (!user.username || !user.password) {
      setErrMessage("Please fill out all required fields!");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
    try {
      console.log("Sending user data:", user);
      const response = await axios.post(`${backendURL}/login`, user,{
        withCredentials: true,
      });
      if(response.data.message !== 'verified'){
          setErrMessage(response.data.message);
        }
        else{
          setUser({ username: "", password: "" });
          navigate('/');
        }

    } catch (error) {
      setErrMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, 2000);
  };
  
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
    <div className={styles.registerBox}>
      <h1>Login to Account</h1>
      <p>Welcome back! Let’s get you in.</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputdiv}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={user.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
          />
        </div>
        <div className={styles.errDiv}>
          {errmessage && (
            <p className={styles.errMessage}>
              <MdError />
              {errmessage}
            </p>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <button className={styles.submit} type="submit">
            Login
          </button>
        )}
      </form>

      <div className={styles.alreadyAcc}>
        <p>Dont have an Account?</p>
        <Link className={styles.loginRedirect} to="/register">
          <p>Register</p>
        </Link>
      </div>
    </div>
    </div>
  );
}

export default Login;
