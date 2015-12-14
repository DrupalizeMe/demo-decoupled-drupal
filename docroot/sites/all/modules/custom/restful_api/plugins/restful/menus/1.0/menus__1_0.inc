<?php

$plugin = array(
  'label' => t('Menus'),
  'description' => t('Expose the menu structures'),
  'resource' => 'menus',
  'class' => 'Menus',
  'data_provider_options' => array(
    'table_name' => 'menu_custom',
    'id_column' => 'menu_name',
  ),
);
