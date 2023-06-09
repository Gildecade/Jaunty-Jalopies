import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  Routes,
  Route,
  Link
} from "react-router-dom";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import Authentication from './pages/authentication/authentication';
import Customer from './pages/customer/customer';
import AddCustomerForm from './pages/customer/addCustomer';
import SalesByColorTable from './pages/sales/salesByColor';
import SalesByTypeTable from './pages/sales/salesByType';
import SalesByManufacturerTable from './pages/sales/salesByManufacturer';
import VehicleDetail from './pages/vehicle/vehicleDetail';
import Repair from './pages/repair/repair';
import AddRepairForm from './pages/repair/addRepair';
import EditRepairForm from './pages/repair/editRepair';
import AddPartForm from './pages/repair/addPart';
import GrossCustomerIncome from './pages/other/grossCustomerIncome';
import RepairReport from './pages/repair/repairReport';
import BelowCostSales from './pages/sales/belowCostSales';
import InventoryTime from './pages/other/inventoryTime';
import PartsStatistics from './pages/parts/partsStatistics';
import MonthlySales from './pages/sales/monthlySale';
import CustomerIncomeDetail from './pages/other/customerIncomeDetail';
import RepairReportDetail from './pages/repair/repairReportDetail';
import MonthlySaleDetail from './pages/sales/monthlySaleDetail';
// TODO: import more components here
import SearchVehicleForm from './pages/vehicle/search';
import AddVehicle from './pages/vehicle/add';
import SellVehicleForm from './pages/vehicle/sell';
import AddManufacturerForm from './pages/vehicle/addManufacturer';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = collapsed => {
    console.log(collapsed);
    setCollapsed(collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <p style={{height: '32px', margin: '16px', color: 'white', fontSize: '24px'}}>Jaunty Jalopies</p>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <SubMenu key="vehicle" icon={<PieChartOutlined />} title="vehicle">
            <Menu.Item key="1"><Link to="/vehicle/search">Search Vehicle</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/vehicle/add">Add Vehicle</Link></Menu.Item>
            {/* <Menu.Item key="3"><Link to="/vehicle/sell"></Link>Sell Vehicle</Menu.Item> */}
          </SubMenu>
          <SubMenu key="customer" icon={<DesktopOutlined />} title="customer">
            <Menu.Item key="4"><Link to="/customer">Lookup Customer</Link></Menu.Item>
            <Menu.Item key="5"><Link to="/addCustomer">Add Customer</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="repair" icon={<UserOutlined />} title="repair">
            <Menu.Item key="6"><Link to="/repair">View Repair</Link></Menu.Item>
            <Menu.Item key="7"><Link to="/addRepair">Add Repair</Link></Menu.Item>
            <Menu.Item key="8"><Link to="/editRepair">Edit Repair</Link></Menu.Item>
            <Menu.Item key="9"><Link to="/repairReport">View Repair Report</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="parts" icon={<TeamOutlined />} title="parts">
            <Menu.Item key="10"><Link to="/addPart">Add Parts</Link></Menu.Item>
            <Menu.Item key="11"><Link to="/partsStatistics">View Parts Statistics</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="sales" icon={<FileOutlined />} title="sales">
            <Menu.Item key="12"><Link to="/byColor">Viwe Sales By Color</Link></Menu.Item>
            <Menu.Item key="13"><Link to="/byType">Viwe Sales By Type</Link></Menu.Item>
            <Menu.Item key="14"><Link to="/byManufacturer">Viwe Sales By Manufacturer</Link></Menu.Item>
            <Menu.Item key="15"><Link to="/monthlySales">View Monthly Sales</Link></Menu.Item>
            <Menu.Item key="17"><Link to="/belowCostSales">View Below Cost Sales</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="other" icon={<FileOutlined />} title="other">
            <Menu.Item key="16"><Link to="/grossCustomerIncome">View Gross Customer Income</Link></Menu.Item>
            <Menu.Item key="18"><Link to="/inventoryTime">View Average Time in Inventory</Link></Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: 'white' }}>
          <Authentication />
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Routes>
              <Route path="/customer" element={<Customer />} />
              <Route path="/addCustomer" element={<AddCustomerForm />} />
              <Route path="/byColor" element={<SalesByColorTable />} />
              <Route path="/byType" element={<SalesByTypeTable />} />
              <Route path="/byManufacturer" element={<SalesByManufacturerTable />} />
              <Route path="/vehicle/:id/:vehicle_type" element={<VehicleDetail />} />
              <Route path="/grossCustomerIncome" element={<GrossCustomerIncome />} />
              <Route path="/repairReport" element={<RepairReport />} />
              <Route path="/belowCostSales" element={<BelowCostSales />} />
              <Route path="/inventoryTime" element={<InventoryTime />} />
              <Route path="/partsStatistics" element={<PartsStatistics />} />
              <Route path="/monthlySales" element={<MonthlySales />} />
              <Route path="/customerIncome/:customer_id" element={<CustomerIncomeDetail />} />
              <Route path="/repairReportDetail/:manufacturer" element={<RepairReportDetail />} />
              <Route path="/monthlySaleDetail/:year/:month" element={<MonthlySaleDetail />} />
              <Route path="/repair" element={<Repair />} />
              <Route path="/addRepair" element={<AddRepairForm />} />
              <Route path="/editRepair" element={<EditRepairForm />} />
              <Route path="/addPart" element={<AddPartForm />} />
              <Route path="/vehicle/search" element={<SearchVehicleForm />} />
              <Route path="/vehicle/add" element={<AddVehicle />} />
              <Route path="/vehicle/sell/:vin" element={<SellVehicleForm />} />
              <Route path="/vehicle/addManufacturer" element={<AddManufacturerForm />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>CS6400 Project @ Created by team04 </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
