import React, { useContext, useEffect, useState } from "react";
import Logo from "../../components/commonComponent/LogoWrapper/Logo";
import ToggleButton from "../../components/commonComponent/LogoWrapper/ToggleButton";
import RightNav from "./RightNav";
import SettingContext from "../../helper/settingContext";
import Image from "next/image";

const Header = ({ sidebarOpen, setMode, setLtr, settingData, setSidebarOpen }) => {
  const { state } = useContext(SettingContext)
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [])
  return (
    <div className={`page-header ${sidebarOpen ? "close_icon" : ""}`}>
      <div className={`header-wrapper m-0 ${mounted ? 'skeleton-header' : ""}`}>
        <div className="header-logo-wrapper p-0">
          <div className="logo-wrapper">
            <Logo settingData={settingData} />
          </div>
          <ToggleButton setSidebarOpen={setSidebarOpen} />
          <a className="d-lg-none d-block mobile-logo">
            <Image src={state?.setDarkLogo?.original_url || "/assets/images/logo/1.png"} height={21} width={120} alt="Dark Logo" />
          </a>
        </div>
        <RightNav setMode={setMode} setLtr={setLtr} />
      </div>
    </div>
  );
};

export default Header;
