import { useQuery } from '@tanstack/react-query';
import { useTranslation } from "@/app/i18n/client";
import I18NextContext from "@/helper/i18NextContext";
import { useContext } from 'react';
import { RiBarChart2Line, RiGroupLine, RiLineChartLine, RiWalletLine } from 'react-icons/ri';
import { Col, Container, Row } from 'reactstrap';
import SettingContext from '../../helper/settingContext';
import request from "../../utils/axiosUtils";
import { AnalyticsOverviewAPI } from '../../utils/axiosUtils/API';
import { formatNumber } from "@/utils/numberFormat";

const TopDashSection = () => {
    const { i18Lang } = useContext(I18NextContext);
    const { t } = useTranslation(i18Lang, 'common');
    const { convertCurrency } = useContext(SettingContext)
    const { data } = useQuery({
        queryKey: [AnalyticsOverviewAPI],
        queryFn: () => request({ url: AnalyticsOverviewAPI }),
        refetchOnWindowFocus: false,
        select: (data) => data?.data,
    });

    const overview = data?.overall || {};

    return (
        <section className="dashboard-tiles app-theme-dashboard-tiles">
            <Container fluid={true} className='p-sm-0'>
                <Row className='g-3'>
                    <Col xs={12} sm={6} xl={3}>
                        <div className="card-tiles app-theme-card app-theme-card-tile">
                            <div>
                                <h6>{t("TotalPnL")}</h6>
                                <h3>{convertCurrency(overview?.total_pnl || 0)}</h3>
                            </div>
                            <div className="icon-box app-theme-tile-icon">
                                <RiWalletLine />
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} xl={3}>
                        <div className="card-tiles app-theme-card app-theme-card-tile">
                            <div>
                                <h6>{t("TotalTrades")}</h6>
                                <h3>{overview?.total_trades ?? 0}</h3>
                            </div>
                            <div className="icon-box app-theme-tile-icon">
                                <RiLineChartLine />
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} xl={3}>
                        <div className="card-tiles app-theme-card app-theme-card-tile">
                            <div>
                                <h6>{t("TotalReturnPct")}</h6>
                                <h3>{formatNumber(overview?.avg_return_pct ?? 0, 8)}</h3>
                            </div>
                            <div className="icon-box app-theme-tile-icon">
                                <RiBarChart2Line />
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} xl={3}>
                        <div className="card-tiles app-theme-card app-theme-card-tile">
                            <div>
                                <h6>{t("TotalSessions")}</h6>
                                <h3>{overview?.total_sessions ?? 0}</h3>
                            </div>
                            <div className="icon-box app-theme-tile-icon">
                                <RiGroupLine />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}

export default TopDashSection