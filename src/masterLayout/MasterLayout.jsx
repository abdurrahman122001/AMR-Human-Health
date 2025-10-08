import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px";
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`;
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        {/* <div>
          <Link to='/' className='sidebar-logo'>
            <img
              src='assets/images/logo.png'
              alt='site logo'
              className='light-logo'
            />
            <img
              src='assets/images/logo-light.png'
              alt='site logo'
              className='dark-logo'
            />

          </Link>
        </div> */}
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li className='sidebar-menu-group-title'>Dashboards</li>
            
            {/* AMR Dashboard */}
            <li className='dropdown'>
              <Link to='#' className="d-flex align-items-center text-decoration-none">
                <Icon icon='solar:chart-outline' className='menu-icon me-3' />
                <span className="flex-grow-1">AMR Dashboard</span>
                <Icon icon='ri:arrow-right-s-line' className='arrow-icon text-muted' />
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:human' className='me-3 text-primary' />
                    Human Health
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/amr/animal-health'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:paw' className='me-3 text-warning' />
                    Animal Health
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/amr/environmental-health'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:leaf' className='me-3 text-success' />
                    Environmental Health
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* AMC Dashboard */}
            <li>
              <NavLink
                to='/amc-dashboard'
                className={(navData) => 
                  navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                }
              >
                <Icon icon='solar:chart-2-outline' className='menu-icon me-3' />
                <span>AMC Dashboard</span>
              </NavLink>
            </li>

            {/* AMU Dashboard */}
            <li className='dropdown'>
              <Link to='#' className="d-flex align-items-center text-decoration-none">
                <Icon icon='solar:chart-square-outline' className='menu-icon me-3' />
                <span className="flex-grow-1">AMU Dashboard</span>
                <Icon icon='ri:arrow-right-s-line' className='arrow-icon text-muted' />
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/amu/human-health'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:human' className='me-3 text-primary' />
                    Human Health
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/amu/animal-health'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:paw' className='me-3 text-warning' />
                    Animal Health
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Validation Utilities */}
            <li>
              <NavLink
                to='/validation-utilities'
                className={(navData) => 
                  navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                }
              >
                <Icon icon='solar:shield-check-outline' className='menu-icon me-3' />
                <span>Validation Utilities</span>
              </NavLink>
            </li>

            {/* Settings Dropdown */}
            <li className='dropdown'>
              <Link to='#' className="d-flex align-items-center text-decoration-none">
                <Icon
                  icon='icon-park-outline:setting-two'
                  className='menu-icon me-3'
                />
                <span className="flex-grow-1">Settings</span>
                <Icon icon='ri:arrow-right-s-line' className='arrow-icon text-muted' />
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/company'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:office-building' className='me-3 text-secondary' />
                    Company
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/notification'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:bell-outline' className='me-3 text-info' />
                    Notification
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/theme'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:palette' className='me-3 text-primary' />
                    Theme
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/currencies'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:currency-usd' className='me-3 text-success' />
                    Currencies
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/language'
                    className={(navData) =>
                      navData.isActive ? "active-page d-flex align-items-center text-decoration-none" : "d-flex align-items-center text-decoration-none"
                    }
                  >
                    <Icon icon='mdi:translate' className='me-3 text-warning' />
                    Languages
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </aside>

<main
  className={
    sidebarActive ? "dashboard-main active bg-white" : "dashboard-main bg-white"
  }
>
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle btn btn-link p-0 border-0'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl text-muted'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl text-muted'
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle btn btn-link p-0 border-0'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon text-muted' />
                </button>
                <form className='navbar-search position-relative'>
                  <input 
                    type='text' 
                    name='search' 
                    placeholder='Search' 
                    className="form-control ps-5"
                  />
                  <Icon 
                    icon='ion:search-outline' 
                    className='icon position-absolute top-50 start-0 translate-middle-y ms-3 text-muted' 
                  />
                </form>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                
                {/* Language dropdown */}
                <div className='dropdown d-none d-sm-inline-block'>
                  <button
                    className='btn btn-light rounded-circle p-0 d-flex justify-content-center align-items-center'
                    style={{width: '40px', height: '40px'}}
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='assets/images/lang-flag.png'
                      alt='Wowdash'
                      className='w-24 h-24 object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu dropdown-menu-end border-0 shadow-lg'>
                    <div className='p-3 bg-primary bg-opacity-10 rounded-top'>
                      <h6 className='text-primary mb-0 fw-semibold'>
                        Choose Your Language
                      </h6>
                    </div>
                    <div className='p-3' style={{maxHeight: '300px', overflowY: 'auto'}}>
                      <div className='form-check d-flex align-items-center justify-content-between mb-3'>
                        <label
                          className='form-check-label d-flex align-items-center gap-3 w-100'
                          htmlFor='english'
                        >
                          <img
                            src='assets/images/flags/flag1.png'
                            alt='English'
                            className='rounded-circle'
                            style={{width: '36px', height: '36px'}}
                          />
                          <span className='fw-semibold'>
                            English
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='language'
                          id='english'
                          defaultChecked
                        />
                      </div>
                      <div className='form-check d-flex align-items-center justify-content-between mb-3'>
                        <label
                          className='form-check-label d-flex align-items-center gap-3 w-100'
                          htmlFor='german'
                        >
                          <img
                            src='assets/images/flags/flag4.png'
                            alt='German'
                            className='rounded-circle'
                            style={{width: '36px', height: '36px'}}
                          />
                          <span className='fw-semibold'>
                            German
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='language'
                          id='german'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile dropdown */}
                <div className='dropdown'>
                  <button
                    className='btn btn-link p-0 border-0 rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='assets/images/user.png'
                      alt='image_user'
                      className='rounded-circle object-fit-cover'
                      style={{width: '40px', height: '40px'}}
                    />
                  </button>
                  <div className='dropdown-menu dropdown-menu-end border-0 shadow-lg'>
                    <div className='p-3 bg-primary bg-opacity-10 rounded-top'>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className='text-primary mb-1 fw-semibold'>
                            Shaidul Islam
                          </h6>
                          <span className='text-muted small'>Admin</span>
                        </div>
                        <button type='button' className='btn btn-link p-0 text-muted'>
                          <Icon
                            icon='radix-icons:cross-1'
                            className='icon'
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        className='dropdown-item d-flex align-items-center gap-3 py-2 px-3 rounded text-decoration-none'
                        to='/view-profile'
                      >
                        <Icon
                          icon='solar:user-linear'
                          className='icon text-muted'
                        />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        className='dropdown-item d-flex align-items-center gap-3 py-2 px-3 rounded text-decoration-none'
                        to='/company'
                      >
                        <Icon
                          icon='icon-park-outline:setting-two'
                          className='icon text-muted'
                        />
                        <span>Setting</span>
                      </Link>
                      <hr className="my-2" />
                      <Link
                        className='dropdown-item d-flex align-items-center gap-3 py-2 px-3 rounded text-decoration-none text-danger'
                        to='#'
                      >
                        <Icon icon='lucide:power' className='icon' />
                        <span>Log Out</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer mt-auto py-3 bg-light'>
          <div className='container-fluid'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <p className='mb-0 text-muted'>© 2024 WowDash. All Rights Reserved.</p>
              </div>
              <div className='col-auto'>
                <p className='mb-0 text-muted'>
                  Made by <span className='text-primary'>wowtheme7</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;