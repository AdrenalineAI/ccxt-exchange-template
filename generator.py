from jinja2 import meta
from jinja2schema import infer, to_json_schema
import jinja2
import jinja2schema
import ccxt
import json

class Generator(object):

    def __init__(self):
        self.configuration = None
        self.templateLoader = jinja2.FileSystemLoader(searchpath="./")
        self.templateEnv = jinja2.Environment(loader=self.templateLoader, trim_blocks=True, lstrip_blocks=True)
        self.template = self.templateEnv.get_template('example.js')

    def render_template(self, **kwargs):
        return self.template.render(**kwargs)

    def getUndeclaredTypes(self):
        template_source = self.templateEnv.loader.get_source(self.templateEnv, 'example.js')[0]
        parsed_content = self.templateEnv.parse(template_source)
        return infer(open('example.js').read())

    def writeSchemaFile(self):
        file = open('schema.json', 'w+')
        schema = to_json_schema(self.getUndeclaredTypes())
        file.write(json.dumps(schema, indent=4, sort_keys=True))
        file.close()

    def writeConfigFile(self):
        data = {}
        types = self.getUndeclaredTypes().__dict__
        for k1, v1 in self.getUndeclaredTypes().items():
            # Call another function to process the loop
            data[k1] = {}
            for k2, v2 in v1.items():
                if isinstance(v2, jinja2schema.model.Dictionary):
                   data[k1][k2] = {}
                   for k3, v3 in v2.items():
                       if isinstance(v3, jinja2schema.model.Dictionary):
                          data[k1][k2][k3] = {}
                          for k4, v4 in v3.items():
                              data[k1][k2][k3][k4] = v4.label
                       else:
                          data[k1][k2][k3] = v3.label
                else:
                    data[k1][k2] = v2.label
        config_file = open('specification.json')
        config = json.load(config_file)
        removed_items = (config.items() <= data.items())
        file = open('removals.json', 'w+')
        file.write(json.dumps(removed_items, indent=4, sort_keys=True))
        file = open('configuration.json', 'w+')
        file.write(json.dumps(data, indent=4, sort_keys=True))
        file.close()

if __name__ == "__main__":
   generator = Generator()
   config_file = open('configuration.json')
   configuration = json.load(config_file)
   output_content = generator.render_template(**configuration)
   output_file = open('output.js', 'w+')
   output_file.write(output_content)
   output_file.close()

