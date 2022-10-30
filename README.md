# WaterApp

# Project Mission

	The goal of the project is to create an app that makes water data accessible to the public. Many existing apps focus on weather events, and the aim of this app is to highlight other water-related metrics, like groundwater quality and quantity, water flow, and hazardous water-related events. This data will be sourced from both the client, Alabama Water Institute, and from publicly available APIs. 
	
	This project will be considered a success if we can display water data in a way that is easy to understand, coherent, and teaches the users more about the environment. The interface for the app will be a map with various overlays and data points, and allow users to select which data they would like to view. The app will focus on the state of Alabama to begin, and, if the project timeline allows, expand to the entire continental US.

# Problems We Are Solving

  This project aims to cover the gap in existing weather apps and research data. Weather apps focus on forecasting rain, snow and storms, and visualizing radar data. There is a plethora of other water-related data collected and processed across the country, though it is mostly limited to research or professional use. This app will allow members of the general public to view and understand this data, which they might not otherwise have access to.

# Project Overview

# Website
  Map view: Users should be presented with a map containing various data about water (Google Maps, OSM, GeoApify, Leaflet)
  Data slicing: Users should be able to pick and choose which data they want presented
  Historical View: Users should be able to view historical data for the location of their choice, displayed in a user-friendly format 
  Calculations: Users should be able to perform analysis of the presented data to gather things like max water level, min water level, mean water level, etc…

# Backend Services
  Concurrent Databases: Caching of frequently used data (SQL)
  Automatic Data Gathering: Obtain water data automatically (Go)
  Hosting: Host the application using a DigitalOcean Droplet (?)
