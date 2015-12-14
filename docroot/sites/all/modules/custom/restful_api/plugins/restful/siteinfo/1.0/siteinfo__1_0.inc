<?php

$plugin = array(
    'label' => t('Site information'),
    'description' => t('Expose some basic site information'),
    'resource' => 'siteinfo',
    'class' => 'SiteInfo',
    'data_provider_options' => array(
        'table_name' => 'variable',
        'id_column' => 'name'
    ),
);
