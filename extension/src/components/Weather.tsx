import React from "react";
import { useData } from "../context/DataContext";
import WidgetHeader from "./widget/WidgetHeader";

type WeatherPoint = {
  temp: number;
  time: string;
  symbol: string;
};

function WeatherTable() {
  const data = useData();
  const weather: WeatherPoint[] = data?.weather || [];

  return (
    <div className="widget-card weather">
      <WidgetHeader title={"Weather"} />
      <div className="weather-grid">
        {weather.map((point, i) => (
          <div key={i} className="weather-col">
            <div className="weather-time">{point.time}</div>
            <div className="weather-icon">{point.symbol}</div>
            <div className="weather-temp">{point.temp}˚</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherTable;
