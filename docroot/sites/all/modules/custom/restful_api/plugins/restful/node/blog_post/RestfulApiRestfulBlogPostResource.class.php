<?php

class RestfulApiRestfulBlogPostResource extends RestfulEntityBaseNode {

  /**
   * Overrides RestfulEntityBaseNode::publicFieldsInfo().
   *
   * Explicitly defines the fields that are output by our API.
   *
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['title'] = array(
      'property' => 'title',
    );
    $public_fields['body'] = array(
      'property' => 'body',
      'sub_property' => 'value',
    );
    // Author Name.
    $public_fields['author'] = array(
      'callback' => array($this, 'getAuthorName'),
    );
    // Author Avatar.
    $public_fields['avatar'] = array(
      'callback' => array($this, 'getAuthorAvatar'),
    );
    $public_fields['tags'] = array(
      'callback' => array($this, 'getTags')
    );
    $public_fields['post_date'] = array(
      'callback' => array($this, 'getPostDate'),
    );
    $public_fields['created'] = array(
      'property' => 'created',
    );
    $public_fields['comment_count'] = array(
      'property' => 'comment_count'
    );
    $public_fields['files'] = array(
      'callback' => array($this, 'getFiles')
    );
    $public_fields['image'] = array(
      'callback' => array($this, 'getImage')
    );

    return $public_fields;
  }

  protected function getAuthorName(\EntityMetadataWrapper $wrapper) {
    return $wrapper->author->name->value();
  }

  protected function getAuthorAvatar(\EntityMetadataWrapper $wrapper) {
    $account = user_load($wrapper->author->uid->value());
    $avatar_uri = $account->picture->uri;

    return isset($avatar_uri) ? image_style_url('thumbnail', $avatar_uri) : null;
  }

  protected function getTags(\EntityMetadataWrapper $wrapper) {
    $tag_names = array();
    // Figure out how to map term names to term ids.
    foreach ($wrapper->field_blog_post_tags->value() as $delta => $term) {
      $tag_names[$term->tid] = $term->name;
    }

    return implode(', ', $tag_names);
  }

  protected function getPostDate(\EntityMetadataWrapper $wrapper) {
    return format_date($wrapper->created->value(), 'short');
  }

  protected function getFiles(\EntityMetadataWrapper $wrapper) {
    $files = array();
    foreach ($wrapper->field_blog_post_files->value() as $delta => $file) {
      $files[$file['fid']] = file_create_url($file['uri']);
    }
    return $files;
  }

  protected function getImage(\EntityMetadataWrapper $wrapper) {
    $images = $wrapper->field_blog_post_images->value();
    $first_image = array_pop($images);
    return isset($first_image) ? image_style_url('thumbnail', $first_image['uri']) : null;
  }
}
