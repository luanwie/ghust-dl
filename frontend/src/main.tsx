import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import QueuePage from "./pages/QueuePage"
import DonatePage from "./pages/DonatePage"
import Layout from "./components/Layout"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/donate" element={<DonatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
