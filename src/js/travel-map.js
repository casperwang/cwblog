import React, { Component } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { travelLocations } from './travel-locations';

// Simple world map data - inline to avoid loading issues
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

class TravelMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapError: null,
      isLoading: true,
      hoveredLocation: null,
      showGallery: false,
      isDarkMode: false,
      selectedImageIndex: 0,
      pinnedLocation: null // Tracks the clicked/pinned location
    };
    this.leaveTimeout = null;
  }

  componentDidMount() {
    // Detect initial theme
    this.detectTheme();
    
    // Listen for theme changes
    this.setupThemeListener();
    
    // Preload first images from all locations
    this.preloadInitialImages();
    
    // Set loading to false after component mounts
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1000);
    
    // Add keyboard event listener for arrow key navigation
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  preloadInitialImages = () => {
    // Preload first image from each location for faster display
    travelLocations.forEach((location) => {
      if (location.images && location.images.length > 0) {
        const img = new Image();
        img.src = location.images[0];
        // Optionally preload next image in sequence
        for (let i = 1; i < location.images.length; i++) {
          const img = new Image();
          img.src = location.images[i];
        }
      }
    });
  }

  preloadLocationImages = (location) => {
    // Preload all images for a location when it's hovered
    if (location && location.images) {
      location.images.forEach((imgSrc) => {
        const img = new Image();
        img.src = imgSrc;
      });
    }
  }

  componentWillUnmount() {
    // Clean up theme listener
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    // Clean up leave timeout
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
    // Clean up keyboard event listener
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  detectTheme = () => {
    const isDark = document.body.classList.contains('dark');
    this.setState({ isDarkMode: isDark });
  }

  setupThemeListener = () => {
    // Use MutationObserver to watch for class changes on body
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.detectTheme();
        }
      });
    });

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  getThemeColors = () => {
    const { isDarkMode } = this.state;
    
    if (isDarkMode) {
      return {
        // Dark mode colors
        landFill: '#2d3748',           // Dark gray for land
        landStroke: '#4a5568',         // Lighter gray for borders
        landHover: '#4a5568',          // Hover state
        landPressed: '#1a202c',        // Pressed state
        markerFill: '#ff6b6b',         // Red marker
        markerStroke: '#ffffff',       // White marker border
        markerText: 'white',           // Black text
        markerTextStroke: 'black',   // White text stroke
        loadingBg: 'rgba(29, 30, 32, 0.9)',  // Dark background
        loadingText: '#c4c4c5',        // Light text
        errorBg: 'rgba(29, 30, 32, 0.9)',    // Dark background
        errorText: '#ff6b6b'           // Red error text
      };
    } else {
      return {
        // Light mode colors
        landFill: '#e6f3ff',           // Light blue for land
        landStroke: '#b3d9ff',         // Blue borders
        landHover: '#cce7ff',          // Hover state
        landPressed: '#b3d9ff',        // Pressed state
        markerFill: '#ff6b6b',         // Red marker
        markerStroke: '#ffffff',       // White marker border
        markerText: 'black',           // Black text
        markerTextStroke: 'white',   // White text stroke
        loadingBg: 'rgba(255, 255, 255, 0.9)',  // Light background
        loadingText: '#666666',        // Dark text
        errorBg: 'rgba(255, 255, 255, 0.9)',    // Light background
        errorText: '#dc3545'           // Red error text
      };
    }
  }

  handleMarkerHover = (location) => {
    const { hoveredLocation } = this.state;
    
    // Preload images for this location when hovered
    this.preloadLocationImages(location);
    
    // Only randomize if this is a different location
    let selectedImageIndex = this.state.selectedImageIndex;
    if (!hoveredLocation || hoveredLocation.coordinates[0] !== location.coordinates[0] || 
        hoveredLocation.coordinates[1] !== location.coordinates[1]) {
      if (location.images && location.images.length > 0) {
        selectedImageIndex = Math.floor(Math.random() * location.images.length);
      }
    }
    
    this.setState({ 
      hoveredLocation: location,
      showGallery: true,
      selectedImageIndex: selectedImageIndex
    });
  }

  handleMarkerLeave = () => {
    // Only hide on leave if location is not pinned
    const { pinnedLocation } = this.state;
    if (!pinnedLocation) {
      // Use a longer delay to prevent interference with clicks
      this.leaveTimeout = setTimeout(() => {
        this.setState({ 
          hoveredLocation: null,
          showGallery: false 
        });
      }, 150);
    }
  }

  handleMarkerClick = (location) => {
    // Cancel any pending leave timeout
    this.cancelMarkerLeave();
    
    // Preload all images for the clicked location
    this.preloadLocationImages(location);
    
    let selectedImageIndex = this.state.selectedImageIndex;
    this.setState({ 
      pinnedLocation: location,
      hoveredLocation: location,
      showGallery: true,
      selectedImageIndex: selectedImageIndex
    });
  }

  cancelMarkerLeave = () => {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
  }

  handleImageEnter = () => {
    this.cancelMarkerLeave();
    const { hoveredLocation } = this.state;
    if (hoveredLocation) {
      this.setState({ 
        hoveredLocation: hoveredLocation,
        showGallery: true 
      });
    }
  }

  handleImageLeave = () => {
    // Only hide if location is not pinned
    const { pinnedLocation } = this.state;
    if (!pinnedLocation) {
      this.setState({ 
        hoveredLocation: null,
        showGallery: false 
      });
    }
  }

  handleMapClick = (e) => {
    // Only close if clicking on the map background, not on markers or gallery
    if (e.target.tagName === 'svg' || e.target.tagName === 'path') {
      this.setState({ 
        pinnedLocation: null,
        hoveredLocation: null,
        showGallery: false 
      });
    }
  }

  handleNextImage = (e) => {
    if (e) {
      e.stopPropagation();
    }
    const { pinnedLocation, hoveredLocation, selectedImageIndex } = this.state;
    const activeLocation = pinnedLocation || hoveredLocation;
    if (activeLocation && activeLocation.images && activeLocation.images.length > 0) {
      const nextIndex = (selectedImageIndex + 1) % activeLocation.images.length;
      // Preload the next image in sequence
      if (activeLocation.images[nextIndex]) {
        const img = new Image();
        img.src = activeLocation.images[nextIndex];
      }
      this.setState({ selectedImageIndex: nextIndex });
    }
  }

  handlePrevImage = (e) => {
    if (e) {
      e.stopPropagation();
    }
    const { pinnedLocation, hoveredLocation, selectedImageIndex } = this.state;
    const activeLocation = pinnedLocation || hoveredLocation;
    if (activeLocation && activeLocation.images && activeLocation.images.length > 0) {
      const prevIndex = (selectedImageIndex - 1 + activeLocation.images.length) % activeLocation.images.length;
      // Preload the previous image in sequence
      if (activeLocation.images[prevIndex]) {
        const img = new Image();
        img.src = activeLocation.images[prevIndex];
      }
      this.setState({ selectedImageIndex: prevIndex });
    }
  }

  handleKeyDown = (e) => {
    const { showGallery } = this.state;
    // Only handle arrow keys when gallery is showing
    if (!showGallery) {
      return;
    }
    
    // Right arrow key - next image
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.handleNextImage(e);
    }
    // Left arrow key - previous image
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.handlePrevImage(e);
    }
  }


  render() {
    const { mapError, isLoading, hoveredLocation, showGallery, selectedImageIndex, pinnedLocation } = this.state;
    const colors = this.getThemeColors();

    // Show loading state
    if (isLoading) {
      return (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 80px)',
          zIndex: -1,
          background: 'rgba(0, 0, 0, 0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ 
            fontSize: '18px', 
            color: colors.loadingText, 
            marginBottom: '15px',
            background: colors.loadingBg,
            padding: '10px 20px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            Loading map...
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      );
    }

    // Show error state
    if (mapError) {
      return (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 60px)',
          zIndex: 0,
          background: 'rgba(0, 0, 0, 0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ 
            fontSize: '18px', 
            color: colors.errorText, 
            marginBottom: '15px',
            background: colors.errorBg,
            padding: '10px 20px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            Map Error
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: colors.loadingText,
            background: colors.errorBg,
            padding: '10px 20px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {mapError}
          </div>
        </div>
      );
    }

    return (
      <div style={{
        position: 'fixed',
        top: '20px', // Start closer to header
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 20px)', // Full height minus header
        zIndex: 0,
        background: 'transparent',
        overflow: 'hidden'
      }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 200,
            center: [0, 0]
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
          onClick={this.handleMapClick}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colors.landFill}
                  stroke={colors.landStroke}
                  strokeWidth={1}
                  style={{
                    default: { 
                      fill: colors.landFill,
                      stroke: colors.landStroke,
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    hover: { 
                      fill: colors.landHover,
                      stroke: colors.landStroke,
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    pressed: {
                      fill: colors.landPressed,
                      stroke: colors.landStroke,
                      strokeWidth: 0.5,
                      outline: "none"
                    }
                  }}
                />
              ))
            }
          </Geographies>
           {travelLocations.map((location, index) => (
             <Marker 
               key={index} 
               coordinates={location.coordinates}
             >
               <g
                 onMouseEnter={() => this.handleMarkerHover(location)}
                 onMouseLeave={this.handleMarkerLeave}
                 onClick={(e) => {
                   e.stopPropagation();
                   this.handleMarkerClick(location);
                 }}
                 style={{
                   transform: 'none',
                   transition: 'none',
                   cursor: 'pointer'
                 }}
               >
                 {/* Single Circle Pin */}
                 <circle
                   r={3}
                   fill={colors.markerFill}
                   stroke={colors.markerStroke}
                   strokeWidth={1}
                   style={{
                     transform: 'none',
                     transition: 'none'
                   }}
                 />
                 {/* Location Text */}
                 <text
                   textAnchor="middle"
                   y={-7}
                   style={{
                     fontFamily: 'system-ui, -apple-system, sans-serif',
                     fontSize: '12px',
                     fontWeight: 'bold',
                     fill: colors.markerText,
                     stroke: colors.markerTextStroke,
                     paintOrder: 'stroke fill',
                     transform: 'none',
                     transition: 'none'
                   }}
                 >
                   {location.name}
                 </text>
               </g>
             </Marker>
           ))}
        </ComposableMap>
        
        {/* Simple Photo Popup with Notecard */}
        {showGallery && ((pinnedLocation || hoveredLocation)) && (pinnedLocation || hoveredLocation).images && (pinnedLocation || hoveredLocation).images.length > 0 && (
          <div
            onMouseEnter={this.handleImageEnter}
            onMouseLeave={this.handleImageLeave}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              cursor: 'default',
              display: 'inline-block',
              padding: '0px',
            }}
          >
            {/* Left Arrow */}
            {(pinnedLocation || hoveredLocation).images.length > 1 && (
              <div
                onClick={this.handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '-40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '35px',
                  height: '35px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            
            <div style={{
              position: 'relative',
              backgroundColor: 'white',
              padding: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              borderRadius: '0px'
            }}>
              <img
                src={(pinnedLocation || hoveredLocation).images[selectedImageIndex]}
                alt={`${(pinnedLocation || hoveredLocation).name} - Photo`}
                style={{
                  maxWidth: '60vw',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '0px',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  this.handleMarkerClick(pinnedLocation || hoveredLocation);
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Right Arrow */}
            {(pinnedLocation || hoveredLocation).images.length > 1 && (
              <div
                onClick={this.handleNextImage}
                style={{
                  position: 'absolute',
                  right: '-40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '35px',
                  height: '35px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
              
            {/* Notecard Description - positioned absolutely relative to the container */}
            {(((pinnedLocation || hoveredLocation).times && (pinnedLocation || hoveredLocation).times[selectedImageIndex]) ||
              ((pinnedLocation || hoveredLocation).locations && (pinnedLocation || hoveredLocation).locations[selectedImageIndex]) ||
              ((pinnedLocation || hoveredLocation).descriptions && (pinnedLocation || hoveredLocation).descriptions[selectedImageIndex])) && (
              <div style={{
                position: 'absolute',
                top: '-25px',
                right: '-25px',
                backgroundColor: 'rgba(246, 242, 212, 0.9)',
                padding: '4px 16px',
                borderRadius: '0px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                maxWidth: '250px',
                transform: 'rotate(5deg)',
                zIndex: 1
              }}>
                {(pinnedLocation || hoveredLocation).times && (pinnedLocation || hoveredLocation).times[selectedImageIndex] && (
                  <div style={{
                    fontFamily: (/^[\x00-\x7F]*$/.test((pinnedLocation || hoveredLocation).locations[selectedImageIndex]) ? 'Quicksand' : 'Yomogi'),
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '0px',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    {(pinnedLocation || hoveredLocation).times[selectedImageIndex]}
                  </div>
                )}
                {(pinnedLocation || hoveredLocation).locations && (pinnedLocation || hoveredLocation).locations[selectedImageIndex] && (
                  <div style={{
                    fontFamily: ((() => {
                      const text = (pinnedLocation || hoveredLocation).locations[selectedImageIndex];
                      if (/^[\x00-\x7F]*$/.test(text)) return 'Quicksand'; // ASCII
                      // French or German: basic check for accent and umlaut/eszett
                      if (/[éèêëàâäîïôöùûüçëßäöü]/i.test(text)) return 'Quicksand';
                      return 'Yomogi';
                    })()),
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '6px',
                    textAlign: 'center'
                  }}>
                    {(pinnedLocation || hoveredLocation).locations[selectedImageIndex]}
                  </div>
                )}
                {(pinnedLocation || hoveredLocation).descriptions && (pinnedLocation || hoveredLocation).descriptions[selectedImageIndex] && (
                  <div style={{
                    fontFamily: 'caveat',
                    fontSize: '13px',
                    color: '#555',
                    lineHeight: '1.4'
                  }}>
                    {(pinnedLocation || hoveredLocation).descriptions[selectedImageIndex]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.TravelMap = TravelMap;
}

export default TravelMap;