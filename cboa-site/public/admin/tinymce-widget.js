// TinyMCE Widget for Decap CMS
CMS.registerWidget('tinymce', {
  // Called when the widget is used in the CMS
  controlComponent: CMS.createClass({
    getInitialState: function() {
      return {};
    },

    componentDidMount: function() {
      const self = this;
      const currentValue = this.props.value || '';

      // TinyMCE is already loaded in index.html
      if (window.tinymce) {
        this.initTinyMCE(currentValue);
      } else {
        console.error('TinyMCE not loaded');
      }
    },

    initTinyMCE: function(initialValue) {
      const self = this;

      window.tinymce.init({
        target: document.getElementById('tinymce-editor-' + this.props.forID),
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image link | table | code | help',
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
          }
          h1 { color: #003DA5; font-size: 2.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; }
          h2 { color: #003DA5; font-size: 1.875rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.875rem; }
          h3 { color: #003DA5; font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.75rem; }
          h4 { color: #003DA5; font-size: 1.25rem; font-weight: 600; margin-top: 0.875rem; margin-bottom: 0.625rem; }
          p { margin-bottom: 1rem; }
          a { color: #F97316; text-decoration: underline; }
          a:hover { color: #003DA5; }
          strong { color: #003DA5; font-weight: 600; }
          table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
          th { background-color: #003DA5; color: white; font-weight: 600; padding: 0.75rem; text-align: left; }
          td { border: 1px solid #E5E7EB; padding: 0.75rem; }
          blockquote { border-left: 4px solid #F97316; background-color: #FFF7ED; padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; }
          ul, ol { margin: 1rem 0; padding-left: 2rem; }
          li { margin: 0.5rem 0; }
          img { max-width: 100%; height: auto; }
        `,
        branding: false,
        promotion: false,
        setup: function(editor) {
          editor.on('init', function() {
            editor.setContent(initialValue);
          });

          editor.on('change keyup', function() {
            self.props.onChange(editor.getContent());
          });
        },
        color_map: [
          '#003DA5', 'CBOA Blue',
          '#F97316', 'CBOA Orange',
          '#000000', 'Black',
          '#374151', 'Gray',
          '#FFFFFF', 'White',
          '#EF4444', 'Red',
          '#10B981', 'Green',
          '#3B82F6', 'Blue',
        ],
      });
    },

    componentWillUnmount: function() {
      if (window.tinymce) {
        window.tinymce.remove('#tinymce-editor-' + this.props.forID);
      }
    },

    render: function() {
      return CMS.h('div', {},
        CMS.h('label', { htmlFor: this.props.forID }, this.props.field.get('label')),
        CMS.h('textarea', {
          id: 'tinymce-editor-' + this.props.forID,
          style: { width: '100%', height: '500px' }
        })
      );
    }
  }),

  // Preview component
  previewComponent: CMS.createClass({
    render: function() {
      return CMS.h('div', {
        className: 'tinymce-content',
        dangerouslySetInnerHTML: { __html: this.props.value }
      });
    }
  })
});
