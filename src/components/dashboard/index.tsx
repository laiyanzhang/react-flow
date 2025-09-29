import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Calendar,
  Avatar,
  Button,
  Typography,
  Badge,
} from 'antd';
import { User, Phone, Mail, MoreHorizontal } from 'lucide-react';
import MaterialSelectModal from '../material/selectModal';

const { Title, Text } = Typography;

interface HiringStats {
  position: string;
  count: number;
  candidates: number;
  progress: number;
  color: string;
}

interface RecruitmentProgress {
  key: string;
  fullName: string;
  profession: string;
  status: string;
  statusColor: string;
}

interface NewApplicant {
  key: string;
  name: string;
  position: string;
  avatar: string;
  initials?: string;
}

const Dashboard: React.FC = () => {
  // 招聘统计数据
  const hiringStats: HiringStats[] = [
    {
      position: 'Content Designers',
      count: 3,
      candidates: 5,
      progress: 72,
      color: '#8B5CF6',
    },
    {
      position: 'Node.js Developers',
      count: 9,
      candidates: 12,
      progress: 25,
      color: '#EF4444',
    },
    {
      position: 'Senior UI Designer',
      count: 1,
      candidates: 6,
      progress: 0,
      color: '#E5E7EB',
    },
    {
      position: 'Marketing Managers',
      count: 2,
      candidates: 10,
      progress: 45,
      color: '#3B82F6',
    },
  ];

  // 招聘进度数据
  const recruitmentData: RecruitmentProgress[] = [
    {
      key: '1',
      fullName: 'John Doe',
      profession: 'UI Designer',
      status: 'Tech interview',
      statusColor: '#3B82F6',
    },
    {
      key: '2',
      fullName: 'Ella Clinton',
      profession: 'Content designer',
      status: 'Task',
      statusColor: '#EF4444',
    },
    {
      key: '3',
      fullName: 'Mike Tyler',
      profession: 'Node.js Developer',
      status: 'Resume review',
      statusColor: '#10B981',
    },
    {
      key: '4',
      fullName: 'Marie Arch',
      profession: 'Node.js Developer',
      status: 'Task',
      statusColor: '#EF4444',
    },
    {
      key: '5',
      fullName: 'Sandra Huffman',
      profession: 'UX Designer',
      status: 'Final interview',
      statusColor: '#F59E0B',
    },
  ];

  // 新申请人数据
  const newApplicants: NewApplicant[] = [
    {
      key: '1',
      name: 'Lewis S. Cunningham',
      position: 'Applied for iOS Developer',
      avatar: '',
    },
    {
      key: '2',
      name: 'Danny Nelson',
      position: 'Applied for Node.js Developer',
      avatar: '',
    },
    {
      key: '3',
      name: 'Jennifer Patterson',
      position: 'Applied for Marketing Manager',
      avatar: '',
      initials: 'JP',
    },
    {
      key: '4',
      name: 'Timothy Watson',
      position: 'Applied for iOS Developer',
      avatar: '',
    },
    {
      key: '5',
      name: 'Kimberly Rutledge',
      position: 'Applied for Junior UX Designer',
      avatar: '',
    },
  ];

  const columns = [
    {
      title: 'Full name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Profession',
      dataIndex: 'profession',
      key: 'profession',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: RecruitmentProgress) => (
        <Badge color={record.statusColor} text={status} />
      ),
    },
    {
      title: '',
      key: 'action',
      render: () => <Button type='text' icon={<MoreHorizontal size={16} />} />,
    },
  ];

  const onPanelChange = (value: any, mode: any) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  const [modalVisible, setModalVisible] = useState(false);
  /* const [selectedFiles, setSelectedFiles] = useState<any[]>([]); */

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleConfirm = (items: any[]) => {
    /* setSelectedFiles(items); */
    setModalVisible(false);
    console.log('选中的文件:', items);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <MaterialSelectModal
        visible={modalVisible}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title='选择素材文件'
        maxCount={5}
        // allowedTypes={['IMAGE', 'VIDEO']} // 可以限制文件类型
      />
      {/* 欢迎横幅 */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '24px',
          border: 'none',
        }}
      >
        <Row align='middle'>
          <Col flex='1'>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              Hello Katie!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              You have 16 new applications. It is a lot of work for today! So
              let's start 😊
            </Text>
            <div style={{ marginTop: '16px' }}>
              <Button
                type='link'
                style={{
                  color: 'white',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                onClick={handleOpenModal}
              >
                review it!
              </Button>
            </div>
          </Col>
          <Col>
            <div
              style={{
                width: '120px',
                height: '120px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={48} color='white' />
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧内容 */}
        <Col xs={24} lg={16}>
          {/* 招聘需求统计 */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                You need to hire
              </Title>
            }
            extra={<Button type='link'>see all</Button>}
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              {hiringStats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={1} style={{ margin: 0, fontSize: '48px' }}>
                      {stat.count}
                    </Title>
                    <Text strong>{stat.position}</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text type='secondary'>
                        ({stat.candidates} candidates)
                      </Text>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <Progress
                        type='circle'
                        percent={stat.progress}
                        size={60}
                        strokeColor={stat.color}
                        format={percent => `${percent}%`}
                      />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 招聘进度表格 */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Recruitment progress
              </Title>
            }
            extra={<Button type='primary'>See all</Button>}
          >
            <Table
              columns={columns}
              dataSource={recruitmentData}
              pagination={false}
              size='middle'
            />
          </Card>
        </Col>

        {/* 右侧内容 */}
        <Col xs={24} lg={8}>
          {/* 日历 */}
          <Card style={{ marginBottom: '24px' }}>
            <Calendar
              fullscreen={false}
              onPanelChange={onPanelChange}
              headerRender={({ value }) => {
                return (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {value.format('MMMM YYYY')}
                    </Title>
                  </div>
                );
              }}
            />
          </Card>

          {/* 新申请人 */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                New Applicants
              </Title>
            }
            extra={<Button type='link'>see all</Button>}
          >
            <div>
              {newApplicants.map(applicant => (
                <div
                  key={applicant.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '8px 0',
                  }}
                >
                  <Avatar
                    size={40}
                    src={applicant.avatar}
                    style={{
                      backgroundColor: applicant.initials
                        ? '#f56a00'
                        : '#87d068',
                    }}
                  >
                    {applicant.initials || applicant.name.charAt(0)}
                  </Avatar>
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{applicant.name}</div>
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                      {applicant.position}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      type='text'
                      size='small'
                      icon={<User size={14} />}
                    />
                    <Button
                      type='text'
                      size='small'
                      icon={<Mail size={14} />}
                    />
                    <Button
                      type='text'
                      size='small'
                      icon={<Phone size={14} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
