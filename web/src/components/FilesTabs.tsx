import { useState } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, IconButton, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';

import { API } from '@/api/client';

import type { MainTabsValues } from '@/types/types';

import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { CreateFileDialog } from '@/components/CreateFileDialog';

import { useFileNames } from '@/hooks/useFileNames';
import { useTranslation } from '@/hooks/useTranslation';

import { getFileTypeForTab } from '@/utils/getFileTypeForTab';

export const FilesTabs = () => {
  const { tab, filename } = useParams({ strict: false }) as {
    tab?: MainTabsValues;
    filename?: string;
  };

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { files, isPending, findFile } = useFileNames(getFileTypeForTab(tab));

  const currentTab = tab || 'settings';

  const currentFile = !filename
    ? currentTab === 'settings'
      ? 'config'
      : files[0]?.name
    : findFile(filename)
      ? filename
      : false;

  const [createDialog, setCreateDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState('');
  const [clearDialog, setClearDialog] = useState('');

  return isPending ? (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 50,
      }}
    ></Box>
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {files?.length ? (
          <Tabs
            value={currentFile}
            onChange={(_, value) => {
              const to = value === 'config' ? '/' : `/${currentTab}/${value}`;
              void navigate({ to });
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 50,
              flex: 1,
            }}
          >
            {(!tab || tab === 'settings') && (
              <Tab
                key="config"
                value="config"
                icon={<DisplaySettingsIcon fontSize="small" />}
                iconPosition="start"
                label={t('tabs.config')}
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
            )}

            {files.map(({ name, removable, editable, type }) => {
              let icon = undefined;

              if (type === 'conf') {
                icon = <SettingsOutlinedIcon fontSize="small" />;
              } else if (type === 'list') {
                icon = <DescriptionOutlinedIcon fontSize="small" />;
              } else if (type === 'log') {
                icon = <ArticleOutlinedIcon fontSize="small" />;
              }

              const labelNode = (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box component="span">{name}</Box>

                  {removable && (
                    <IconButton
                      component="span"
                      role="button"
                      tabIndex={0}
                      size="small"
                      sx={{
                        ml: 0.5,
                        p: '2px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveDialog(name);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon
                        color="error"
                        fontSize="inherit"
                      />
                    </IconButton>
                  )}

                  {!editable && (
                    <IconButton
                      component="span"
                      role="button"
                      tabIndex={0}
                      size="small"
                      sx={{
                        ml: 0.5,
                        p: '2px',
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setClearDialog(name);
                      }}
                    >
                      <CleaningServicesIcon
                        color="warning"
                        fontSize="inherit"
                      />
                    </IconButton>
                  )}
                </Box>
              );

              return (
                <Tab
                  key={name}
                  value={name}
                  icon={icon}
                  iconPosition="start"
                  label={labelNode}
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
              );
            })}
          </Tabs>
        ) : (
          <></>
        )}

        {tab === 'lists' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1,
            }}
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => setCreateDialog(true)}
              title={t('create_file.create')}
            >
              <AddOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <ConfirmationDialog
        title={t('confirmation.delete_file.title')}
        description={t('confirmation.delete_file.description')}
        open={Boolean(removeDialog)}
        onClose={() => setRemoveDialog('')}
        onSubmit={async () => {
          const { data } = await API.removeFile(removeDialog);
          if (data?.status === 0) {
            void API.invalidateListFiles();
            if (currentFile === removeDialog) {
              void navigate({ to: `/${currentTab}` });
            }
          }
          setRemoveDialog('');
        }}
      />

      <CreateFileDialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
      />

      <ConfirmationDialog
        title={t('confirmation.clear_log.title')}
        description={t('confirmation.clear_log.description')}
        open={Boolean(clearDialog)}
        onClose={() => setClearDialog('')}
        onSubmit={async () => {
          const { data } = await API.saveFile(clearDialog, '');
          if (data?.status === 0) {
            void API.invalidateFileContent(clearDialog);
          }
          setClearDialog('');
        }}
      />
    </>
  );
};
