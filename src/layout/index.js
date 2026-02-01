'use client'
import React, { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Container } from "reactstrap";
import ConvertPermissionArr from "../utils/customFunctions/ConvertPermissionArr";
import Footer from "./footer";
import Header from "./header";
import Sidebar from "./sidebar";
import { replacePath } from "../utils/customFunctions/ReplacePath";
import I18NextContext from "@/helper/i18NextContext";

const Layout = (props) => {
  const { i18Lang, setI18Lang } = useContext(I18NextContext);
  useEffect(() => {
    if (i18Lang == "") {
      setI18Lang(props.lng);
    }
  }, [props.lng]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState(false);
  const [ltr, setLtr] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const [data1, setData1] = useState({});
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const ISSERVER = typeof window === "undefined";
    if (!ISSERVER) {
      try {
        const accountData = localStorage.getItem("account");
        if (accountData && accountData !== "undefined" && accountData !== "null") {
          const parsed = JSON.parse(accountData);
          setData1(parsed || {});
        }
      } catch (error) {
        console.error("Failed to parse account from localStorage:", error);
        setData1({});
      }
    }
  }, []);
  
  useEffect(() => {
    mode ? document.body.classList.add("dark-only") : document.body.classList.remove("dark-only");
  }, [mode, ltr]);
  
  useEffect(() => {
    if (!mounted) return;
    if (!data1 || !data1.permissions || !Array.isArray(data1.permissions) || data1.permissions.length === 0) {
      return; // Don't redirect if permissions are not loaded yet
    }
    const securePaths = ConvertPermissionArr(data1.permissions);
    const currentPath = path?.split("/")[2];
    const replacedPath = replacePath(currentPath);
    if (securePaths && securePaths.length > 0 && !securePaths.find((item) => item?.name == replacedPath)) {
      router.push(`/403`);
    }
  }, [mounted, data1, path, router]);
  return (
    <>
      <div className="page-wrapper compact-wrapper" id="pageWrapper">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setMode={setMode} setLtr={setLtr} settingData={'settingData'} />
        <div className="page-body-wrapper">
          <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <div className="page-body">
            <Container fluid={true}>
              {props.children}
            </Container>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
