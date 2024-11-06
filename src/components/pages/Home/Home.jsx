import React from "react";
import "./Home.css";
import Acercade from "../../common/Acercade/Acercade";

function Home() {
  return (
    <>
      <div className="banner text-white">
        <h2>GASTOS APP</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates
          tempore quaerat, temporibus iusto sapiente ipsam porro optio sed, id
          odio ipsum quo corrupti ad obcaecati illo mollitia iure dolorum! Quis
          autem ea neque provident aliquam unde quisquam? Mollitia excepturi,
          labore molestias saepe recusandae veritatis perspiciatis voluptas
          fuga, nostrum facilis sed!
        </p>
        <button className="btn btn-secondary">Ver más</button>
      </div>
      <div>
        <Acercade />
      </div>
    </>
  );
}

export default Home;
