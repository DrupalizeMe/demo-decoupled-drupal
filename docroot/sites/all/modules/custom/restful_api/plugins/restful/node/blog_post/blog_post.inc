<?php

$plugin = array(
  'label' => t('Blog Post'),
  'resource' => 'blog',
  'name' => 'blog_post',
  'entity_type' => 'node',
  'bundle' => 'blog_post',
  'description' => t('Export the blog_post content type.'),
  'class' => 'RestfulApiRestfulBlogPostResource',
);
