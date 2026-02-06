import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { Box, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';

import { mainTabsValues, type MainTabsValues } from '@/types/types';

import { useTranslation } from '@/hooks/useTranslation';

export const MainTabs = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { tab } = useParams({ strict: false }) as {
    tab?: MainTabsValues;
  };

  const currentTab = !tab
    ? 'settings'
    : mainTabsValues.includes(tab)
      ? tab
      : false;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, value) => {
            void navigate({ to: value === 'settings' ? '/' : `/${value}` });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 50,
            flex: 1,
          }}
        >
          <Tab
            key="settings"
            value="settings"
            icon={<DisplaySettingsIcon fontSize="small" />}
            iconPosition="start"
            label={t('tabs.settings')}
            sx={{
              minHeight: '50px',
              fontSize: 14,
              transition: 'color 0.1s ease-in-out',
              '&.Mui-selected': {
                color: 'text.primary',
              },
              '&:hover': {
                color: 'text.primary',
              },
            }}
          />

          <Tab
            key="lists"
            value="lists"
            icon={<DescriptionOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={t('tabs.lists')}
            sx={{
              minHeight: '50px',
              fontSize: 14,
              transition: 'color 0.1s ease-in-out',
              '&.Mui-selected': {
                color: 'text.primary',
              },
              '&:hover': {
                color: 'text.primary',
              },
            }}
          />

          <Tab
            key="logs"
            value="logs"
            icon={<ArticleOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={t('tabs.logs')}
            sx={{
              minHeight: '50px',
              fontSize: 14,
              transition: 'color 0.1s ease-in-out',
              '&.Mui-selected': {
                color: 'text.primary',
              },
              '&:hover': {
                color: 'text.primary',
              },
            }}
          />
        </Tabs>
      </Box>
    </>
  );
};
