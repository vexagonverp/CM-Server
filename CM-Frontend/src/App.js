import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Progress,
  Statistic,
  Badge,
  Layout,
  Anchor,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  Select,
  Slider,
} from 'antd';
import {
  LinkOutlined,
  GithubOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';
import socketIOClient from 'socket.io-client';
import './App.css';
const host = 'http://localhost:3000';
const { Header, Footer, Content } = Layout;
const { Link } = Anchor;
const { Text } = Typography;
const { Option } = Select;
function App() {
  const [mess, setMess] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const [patientArr, setPatientArr] = useState([]);
  const [minuteInput, setMinuteInput] = useState();
  const [minutePredict, setMinutePredict] = useState();
  const [patientId, setPatientId] = useState();

  const onChangeMinute = (value) => {
    setMinuteInput(value);
  };

  const onChangePatient = (value) => {
    setPatientId(value);
  };

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);
    fetch('http://localhost:3000/getKeys')
      .then((response) => response.json())
      .then((data) => setPatientArr(data));
    socketRef.current.on('message', (dataGot) => {
      setMess(dataGot);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    setLoading(true);
    if (patientId != null) {
      const mes = {
        id: patientId,
        minute: minuteInput ? minuteInput : 1,
      };
      setMinutePredict(minuteInput ? minuteInput : 1);
      socketRef.current.emit('message', mes);
      socketRef.current.once('message', (dataGot) => {
        setMess(dataGot);
        setLoading(false);
      });
    }
  };

  return (
    <Layout>
      <Header></Header>
      <Content>
        <Row>
          <Col xs={1} sm={1} md={2} lg={3} xl={3}></Col>
          <Col xs={22} sm={22} md={20} lg={18} xl={18}>
            <Card title='Covid monitoring' loading={loading}>
              <Divider orientation='left'>Patient's information</Divider>
              <Row>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Space direction='vertical'>
                    <Text type='secondary'>Heart Rate</Text>
                    <Progress
                      type='circle'
                      strokeColor={{
                        '0%': '#FF0000',
                        '60%': '#87d068',
                      }}
                      format={(percent) => `${percent} bpm`}
                      percent={mess.heartRate}
                    />
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Space direction='vertical'>
                    <Text type='secondary'>SpO2</Text>
                    <Progress
                      type='circle'
                      strokeColor={{
                        '0%': '#FF0000',
                        '90%': '#87d068',
                      }}
                      percent={mess.spO}
                    />
                  </Space>
                </Col>
              </Row>
              <Divider orientation='left'>
                Prediction in next {minutePredict} minutes
              </Divider>
              <Row>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Badge count={mess.errorHeart}>
                    <Statistic
                      title='Prediction heart rate'
                      prefix={
                        (
                          mess.predHeart *
                          ((100 - Math.abs(mess.errorHeart)) / 100)
                        ).toFixed(2) + ' - '
                      }
                      value={(
                        mess.predHeart *
                        ((100 + Math.abs(mess.errorHeart)) / 100)
                      ).toFixed(2)}
                      suffix='bpm'
                    />
                  </Badge>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Badge count={mess.errorSpo}>
                    <Statistic
                      title='Prediction SpO2'
                      prefix={
                        (
                          mess.predSpo *
                          ((100 - Math.abs(mess.errorSpo)) / 100)
                        ).toFixed(2) + ' - '
                      }
                      value={(
                        mess.predSpo *
                        ((100 + Math.abs(mess.errorSpo)) / 100)
                      ).toFixed(2)}
                      suffix='%'
                    />
                  </Badge>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={1} sm={1} md={2} lg={3} xl={3}></Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Space
              direction='horizontal'
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <DisconnectOutlined
                  style={{
                    fontSize: 32,
                    padding: 20,
                  }}
                />
              ) : (
                <LinkOutlined
                  style={{
                    fontSize: 32,
                    padding: 20,
                  }}
                />
              )}
            </Space>
          </Col>
          <Col xs={1} sm={1} md={2} lg={3} xl={3}></Col>
          <Col xs={22} sm={22} md={20} lg={18} xl={18}>
            <Card title='Data submission'>
              <Row>
                <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text type='secondary'>Patient's identifier</Text>
                    <Select
                      style={{ width: 80 + '%' }}
                      onChange={onChangePatient}
                    >
                      {patientArr.map((patientId) => (
                        <Option key={patientId.id}>{patientId.id}</Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
                <Col xs={12} sm={8} md={8} lg={8} xl={8}>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text type='secondary'>Prediction in minutes</Text>
                    <Slider
                      min={1}
                      max={8}
                      step={0.5}
                      defaultValue={1}
                      onChange={onChangeMinute}
                    />
                  </Space>
                </Col>
                <Col
                  xs={{ span: 11, offset: 1 }}
                  sm={{ span: 7, offset: 1 }}
                  md={{ span: 6, offset: 1 }}
                  lg={{ span: 6, offset: 1 }}
                  xl={{ span: 6, offset: 1 }}
                >
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text type='secondary'></Text>
                    <Button type='primary' onClick={sendMessage}>
                      Send
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={1} sm={1} md={2} lg={3} xl={3}></Col>
        </Row>
      </Content>
      <Footer>
        <Anchor>
          <Link
            href='https://github.com/vexagonverp/CM-Server'
            title={
              <GithubOutlined
                style={{
                  fontSize: 32,
                }}
              />
            }
          />
        </Anchor>
      </Footer>
    </Layout>
  );
}

export default App;
