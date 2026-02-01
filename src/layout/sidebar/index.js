import React, { useContext, useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import LogoWrapper from "../../components/commonComponent/LogoWrapper";
import MENUITEMS from "./MenuData";
import AccountContext from "../../helper/accountContext";
const MenuList = dynamic(() => import("./MenuList"), {
  ssr: false,
})
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [activeMenu, setActiveMenu] = useState([]);
  const { role, setRole } = useContext(AccountContext)
  let storePermission = {};
  const ISSERVER = typeof window === "undefined";
  if (!ISSERVER) {
    try {
      const accountData = localStorage.getItem("account");
      if (accountData && accountData !== "undefined" && accountData !== "null") {
        storePermission = JSON.parse(accountData);
      }
    } catch (error) {
      console.error("Failed to parse account from localStorage:", error);
      storePermission = {};
    }
  }
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("role");
      if (storedRole && storedRole !== "undefined" && storedRole !== "null") {
        const parsedRole = JSON.parse(storedRole);
        if (parsedRole && parsedRole.name) {
          setRole(parsedRole.name);
        }
      }
    } catch (error) {
      console.error("Failed to parse role from localStorage:", error);
      // Clear invalid role from localStorage
      localStorage.removeItem("role");
    }
  }, [])

  return (
    <div className={`sidebar-wrapper ${sidebarOpen ? "close_icon" : ""}`}>
      <div id="sidebarEffect" />
      <div className={`${mounted ? 'skeleton-loader' : ""}`}>
        <LogoWrapper setSidebarOpen={setSidebarOpen} />
        <nav className="sidebar-main">
          <div id="sidebar-menu">
            <ul className="sidebar-links" id="simple-bar">
              <MenuList menu={MENUITEMS} level={0} activeMenu={activeMenu} setActiveMenu={setActiveMenu} key={role} />
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
