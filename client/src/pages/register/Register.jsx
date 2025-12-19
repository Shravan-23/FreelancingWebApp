import React, { useState } from "react";
import "./Register.scss";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";

function Register() {
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    country: Yup.string().required("Country is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\+?[\d\s-]+$/, "Invalid phone number format"),
    desc: Yup.string(),
    isSeller: Yup.boolean(),
  });

  const initialValues = {
    username: "",
    email: "",
    password: "",
    country: "",
    phone: "",
    desc: "",
    isSeller: false,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const url = file ? await upload(file) : null;
      await newRequest.post("/auth/register", {
        ...values,
        img: url,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register">
      <div className="container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <h1>Create a new account</h1>
              <div className="form-group">
                <Field
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="input-field"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="input-field"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="input-field"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="country"
                  type="text"
                  placeholder="Country"
                  className="input-field"
                />
                <ErrorMessage
                  name="country"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="phone"
                  type="text"
                  placeholder="Phone Number"
                  className="input-field"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="desc"
                  as="textarea"
                  placeholder="Brief description of yourself"
                  className="input-field"
                />
                <ErrorMessage
                  name="desc"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label className="file-label">
                  Profile Picture
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                  />
                </label>
                {file && <span className="file-name">{file.name}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <Field type="checkbox" name="isSeller" />
                  Activate the seller account
                </label>
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </button>
              {error && <div className="error">{error}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
