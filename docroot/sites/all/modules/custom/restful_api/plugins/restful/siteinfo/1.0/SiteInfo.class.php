<?php

/**
 * @file
 *
 * Provide some basic site information to the API.
 *
 */

/**
 * @class SiteInfo.
 */

class SiteInfo extends RestfulDataProviderDbQuery {
    /**
     * {@inheritdoc}
     */
    public function publicFieldsInfo() {
        return array(
            'name' => array(
                'property' => 'name',
            ),
            'value' => array(
                'callback' => array($this, 'getVariableValue')
            )
        );
    }
  
    protected function getVariableValue($row) {
      return unserialize($row->value);
    }
}
