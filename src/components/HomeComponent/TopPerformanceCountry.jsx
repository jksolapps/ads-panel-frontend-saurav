/** @format */

import React, { useEffect, useState } from 'react';
import { ReactComponent as EmptyTableIcon } from '../../assets/images/empty-table-icon.svg';
import useApi from '../../hooks/useApi';
const TopPerformanceCountry = ({ overviewSelect }) => {
  const [appPerformanceData, setAppPerformanceData] = useState([]);
  const formData = new FormData();

  formData.append('user_id', localStorage.getItem('id'));
  formData.append('user_token', localStorage.getItem('token'));
  formData.append('type', overviewSelect);
  const fetchData = async () => {
    try {
      const response = await useApi('dashboard-app-performance-list', formData);
      setAppPerformanceData(response?.data?.aaData);
    } catch (error) {
      if (error.response.status === 401) {
        console.error('Unauthorized access. Please check your credentials.');
      } else if (error.response) {
        console.error(error.response.data);
      } else {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, [overviewSelect]);

  return (
    <div className='box-row box2'>
      <div className='sm-title'>Top Performing Country</div>
      <div className='table-wrap pdglr16'>
        {appPerformanceData?.length === 0 ? (
          <div className='particle-table-placeholder'>
            <EmptyTableIcon />
            <div className='empty-table-text'>No data to display</div>
          </div>
        ) : (
          <table className='app-performance-table'>
            <thead>
              <tr>
                <th>App</th>
                <th>Est. earnings</th>
                <th>Impression</th>
              </tr>
            </thead>
            <tbody>
              {appPerformanceData?.map((data, index) => (
                <tr key={index}>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: data?.app_display_name,
                    }}
                    onClick={() =>
                      localStorage.setItem('app_auto_id', data?.app_auto_id)
                    }
                  />
                  <td
                    dangerouslySetInnerHTML={{
                      __html: data?.est_earnings,
                    }}
                  ></td>
                  <td
                  // dangerouslySetInnerHTML={{
                  //   __html: data?.est_earnings,
                  // }}
                  >
                    <h5 className='mb-1 fw-normal'>0% </h5>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TopPerformanceCountry;
