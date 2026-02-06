import Link from "next/link";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { Col } from "reactstrap";
import useOutsideDropdown from "../../utils/hooks/customHooks/useOutsideDropdown";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";
import Language from "./Language";
import NotificationBox from "./NotificationBox";
import ProfileNav from "./ProfileNav";
import { useContext } from "react";
import I18NextContext from "@/helper/i18NextContext";
import { useTranslation } from "@/app/i18n/client";
import { useTheme } from "@/context/ThemeContext";
import { ModeToggle } from "@/components/mode/ModeToggle";

const RightNav = ({ setLtr }) => {
  const { i18Lang } = useContext(I18NextContext);
  const { t } = useTranslation(i18Lang, 'common');
  const { theme, toggleTheme } = useTheme();
  const [isProductCreate] = usePermissionCheck(["create"], "product");
  const [isOrderCreate] = usePermissionCheck(["create"], "order");
  const { ref, isComponentVisible, setIsComponentVisible } = useOutsideDropdown();
  return (
    <Col className="nav-right pull-right right-header p-0">
      <div className="header-btns d-none d-lg-flex">
        {isProductCreate && <Link href={`/${i18Lang}/product/create`} className="btn btn-outline">{t("AddProduct")}</Link>}
        {isOrderCreate && <Link href={`/${i18Lang}/order/create`} className="btn btn-animation">{t("AddOrder")}</Link>}
      </div>
      <ul className="nav-menus" ref={ref}>
        <Language isComponentVisible={isComponentVisible} setIsComponentVisible={setIsComponentVisible} />
        <NotificationBox isComponentVisible={isComponentVisible} setIsComponentVisible={setIsComponentVisible} />
        <li>
          <ModeToggle />
        </li>
        <li>
          <div className="mode">
            <button
              type="button"
              className="border-0 bg-transparent p-0"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <RiSunLine className="ri-sun-line" style={{ fontSize: "1.25rem", color: "var(--app-text)" }} />
              ) : (
                <RiMoonLine className="ri-moon-line" style={{ fontSize: "1.25rem", color: "var(--app-text)" }} />
              )}
            </button>
          </div>
        </li>
        <ProfileNav isComponentVisible={isComponentVisible} setIsComponentVisible={setIsComponentVisible} />
      </ul>
    </Col>
  );
};

export default RightNav;
