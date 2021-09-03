<script lang="ts">
  export let xml: string = "";

  function formatXml(xml) {
    var formatted = "";
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, "$1\r\n$2$3");
    var pad = 0;

    let xmlArr = xml.split("\r\n");
    for (const node of xmlArr) {
      var indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad != 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      var padding = "";
      for (var i = 0; i < pad; i++) {
        padding += "&nbsp;";
      }

      formatted += padding + node + "\r\n";
      pad += indent;
    }

    return formatted;
  }

  $: xml = formatXml(xml);
</script>

<pre>{xml}</pre>

<style>
  pre {
    padding: 0 1rem;
  }
</style>
