<?php

/**
 * @file
 * Contains \Menus.
 */

/**
 * @class Menus.
 */
class Menus extends RestfulDataProviderDbQuery {

    /**
     * {@inheritdoc}
     */
    public function publicFieldsInfo() {
        return array(
            'name' => array(
                'property' => 'menu_name',
            ),
            'title' => array(
                'property' => 'title',
            ),
            'description' => array(
                'property' => 'description',
            ),
            'links' => array(
                'callback' => array($this, 'buildLinks'),
            ),
        );
    }

    /**
     * Callback to generate the output of links.
     * @param  object $row
     *   Database record.
     *
     * @return array
     */
    protected function buildLinks($row) {
        $items = array();
        if ($tree = menu_tree($row->menu_name)) {

            $items = self::buildMenuLinks($tree);

        }

        return $items;
    }

    /**
     * Build the menu tree.
     *
     * @param  array $tree
     *   Expects the structure returned by menu_tree()
     *
     * @see  menu_tree().
     *
     * @return array       [description]
     */
    protected function buildMenuLinks($tree) {
        $items = array();

        foreach (element_children($tree) as $delta) {
            $item = array();
            $item['title'] = $tree[$delta]['#title'];
            $item['href'] = $tree[$delta]['#href'];
            $item['weight'] = $tree[$delta]['#original_link']['weight'];
            $item['depth'] = $tree[$delta]['#original_link']['depth'];

            $attributes = array();

            // Attributes in "localized options" principally are provided by the Menu
            // Attributes module; if attributes aren't set, we'll ensure that the
            // expected key exists anyway.
            $tree[$delta]['#localized_options'] += array('attributes' => array());

            // Filter out blank attributes.
            foreach ($tree[$delta]['#localized_options']['attributes'] as $key => $value) {
                if ((is_array($value) && empty($value)) || is_string($value) && !drupal_strlen($value)) {
                    unset($tree[$delta]['#localized_options']['attributes'][$key]);
                }
            }

            // Special processing for user-provided classes...
            if (isset($tree[$delta]['#localized_options']['attributes']['class']) && is_string($tree[$delta]['#localized_options']['attributes']['class'])) {
                $tree[$delta]['#localized_options']['attributes']['class'] = array_filter(explode(' ', $tree[$delta]['#localized_options']['attributes']['class']));
            }

            $item['attributes'] = drupal_array_merge_deep($tree[$delta]['#attributes'], $tree[$delta]['#localized_options']['attributes']);

            // Recursively process exposed children links. Remember that exposing
            // sub-menus is a configuration against the parent menu item.
            $item['children'] = self::buildMenuLinks($tree[$delta]['#below']);

            $items[] = $item;
        }

        return $items;
    }
}
