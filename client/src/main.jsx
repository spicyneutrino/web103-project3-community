import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { getLocations, getLocation, getEvents } from "./services/api";
import { countdown } from "./components/time";
import "./style.css";

const icons = { music: "🎵", garden: "🌳", art: "🎨", food: "🍽️" };

function useData(load, dependencies = []) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    load(controller.signal)
      .then(data => setState({ data, loading: false }))
      .catch(error => {
        if (error.name !== "AbortError") setState({ error, loading: false });
      });
    return () => controller.abort();
  }, dependencies);
  return state;
}

function Status({ state, children }) {
  if (state.loading) return <p role="status">Loading...</p>;
  if (state.error) return <p role="alert">{state.error.status === 404 ? "Location not found." : "Could not load data. Please try refreshing the page."}</p>;
  return children(state.data);
}

function Home() {
  const state = useData(getLocations);
  return <>
    <h1>After Hours Community</h1>
    <p>Choose a location to see its events.</p>
    <Status state={state}>{locations => <div className="locations">
      {locations.map(location => <Link className="location" key={location.id} to={`/locations/${location.slug}`} style={{ background: location.color }}>
        <span className="icon" aria-hidden="true">{icons[location.icon]}</span>
        <h2>{location.name}</h2>
        <p>{location.category}</p>
      </Link>)}
    </div>}</Status>
  </>;
}

function EventList({ events }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!events.length) return <p>No events found.</p>;
  return <div>{events.map(event => <article className={`event ${new Date(event.starts_at).getTime() <= now ? "past" : ""}`} key={event.id}>
    <h2>{event.title}</h2>
    <p><Link to={`/locations/${event.location_slug}`}>{event.location_name}</Link></p>
    <p><time dateTime={event.starts_at}>{new Date(event.starts_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })} CT</time></p>
    <p>{event.description}</p>
    <p>{event.price} | {countdown(event.starts_at, now)}</p>
  </article>)}</div>;
}

function LocationPage() {
  const { slug } = useParams();
  const state = useData(signal => Promise.all([getLocation(slug, signal), getEvents(slug, signal)]), [slug]);
  return <>
    <Link to="/">Back to locations</Link>
    <Status state={state}>{([location, events]) => <>
      <h1>{location.name}</h1>
      <p>{location.description}</p>
      <p>{location.address}</p>
      <h2>Events at this location</h2>
      <EventList events={events} />
    </>}</Status>
  </>;
}

function EventsPage() {
  const state = useData(signal => Promise.all([getLocations(signal), getEvents(undefined, signal)]));
  const [location, setLocation] = useState("");
  return <>
    <h1>All events</h1>
    <Status state={state}>{([locations, events]) => <>
      <label htmlFor="location-filter">Filter by location: </label>
      <select id="location-filter" value={location} onChange={event => setLocation(event.target.value)}>
        <option value="">All locations</option>
        {locations.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </select>
      <EventList events={events.filter(event => !location || event.location_slug === location)} />
    </>}</Status>
  </>;
}

function App() {
  return <BrowserRouter>
    <a className="skip" href="#main">Skip to content</a>
    <nav aria-label="Main navigation"><Link to="/">Locations</Link> | <Link to="/events">All events</Link></nav>
    <main id="main"><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/locations/:slug" element={<LocationPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="*" element={<><h1>Page not found</h1><Link to="/">Back to locations</Link></>} />
    </Routes></main>
  </BrowserRouter>;
}

createRoot(document.getElementById("root")).render(<App />);
