import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        {
          path: '/page/:id',
          component: '@/pages/editor/index',
        },
        {
          path: '/list',
          component: '@/pages/list/index',
        },
        {
          path: '/plugins',
          component: '@/pages/plugins/index',
        },
        {
          path: '/settings',
          component: '@/pages/settings/index',
        },
        {
          path: '/keyboard',
          component: '@/pages/keyboard/index',
        },
      ],
    },
  ],
  outputPath: 'build',
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: '@material-ui/core',
        // Use "'libraryDirectory': ''," if your bundler does not support ES modules
        libraryDirectory: 'esm',
        camel2DashComponentName: false,
      },
      'core',
    ],
    [
      'babel-plugin-import',
      {
        libraryName: '@material-ui/icons',
        // Use "'libraryDirectory': ''," if your bundler does not support ES modules
        libraryDirectory: 'esm',
        camel2DashComponentName: false,
      },
      'icons',
    ],
    [
      'babel-plugin-styled-components',
      {
        ssr: false,
        displayName: true,
      },
    ],
  ],
  antd: false,
  dva: false,
  layout: false,
  targets: {
    chrome: 87,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
});
