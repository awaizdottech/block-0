import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router-dom";
import { Footer, Header } from "./components";

function App() {
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false); // temp

  return !loading ? (
    <section className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </section>
  ) : (
    <p>Loading...</p>
  ); // todo set timer for loading after which it ends
}

export default App;
