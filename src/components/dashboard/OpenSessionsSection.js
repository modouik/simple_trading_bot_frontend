import { useQuery } from "@tanstack/react-query";
import DashboardWrapper from "./DashboardWrapper";
import request from "../../utils/axiosUtils";
import { SessionsActiveAPI } from "../../utils/axiosUtils/API";
import { Table } from "reactstrap";
import I18NextContext from "@/helper/i18NextContext";
import { useContext } from "react";
import { useTranslation } from "@/app/i18n/client";
import { getSessionStatusClass } from "../trading-dashboard/utils";

const OpenSessionsSection = () => {
  const { i18Lang } = useContext(I18NextContext);
  const { t } = useTranslation(i18Lang, "common");
  const { data, isLoading } = useQuery({
    queryKey: [SessionsActiveAPI],
    queryFn: () => request({ url: SessionsActiveAPI }),
    refetchOnWindowFocus: false,
    select: (res) => res?.data?.data ?? [],
  });

  return (
    <DashboardWrapper classes={{ title: "OpenSessions", colProps: { sm: 12 } }}>
      <div className="table-responsive">
        <Table>
          <thead>
            <tr>
              <th>{t("SessionId")}</th>
              <th>{t("Strategy")}</th>
              <th>{t("Symbol")}</th>
              <th>{t("Mode")}</th>
              <th>{t("Trades")}</th>
              <th>{t("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>{t("Loading")}...</td>
              </tr>
            ) : (
              data?.slice(0, 6)?.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.strategy_name}</td>
                  <td>{session.symbol}</td>
                  <td>{session.mode}</td>
                  <td>{session.number_of_trades ?? 0}</td>
                  <td>
                    <div className={getSessionStatusClass(session.status)}>
                      <span>{session.status ?? "unknown"}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </DashboardWrapper>
  );
};

export default OpenSessionsSection;
