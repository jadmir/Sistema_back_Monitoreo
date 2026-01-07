import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generarDocumentoWord = async (data, nombrePlantilla = "plantilla_capacitacion.docx") => {
  try {
    // Ruta de la plantilla
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      nombrePlantilla
    );

    // Verificar que existe la plantilla
    if (!fs.existsSync(templatePath)) {
      throw new Error("Plantilla no encontrada: " + templatePath);
    }

    // Leer la plantilla como buffer
    const content = fs.readFileSync(templatePath);

    const zip = new PizZip(content);

    // Configurar módulo de imágenes
    const imageOpts = {
      centered: true, // Centrar las imágenes
      getImage: (tagValue) => {
        // Si tagValue es una ruta de archivo, leerla
        if (typeof tagValue === "string" && tagValue.length > 0) {
          const imagePath = path.join(process.cwd(), "src", tagValue);
          if (fs.existsSync(imagePath)) {
            return fs.readFileSync(imagePath);
          }
        }
        return null;
      },
      getSize: () => {
        // Tamaño de la imagen en píxeles (ancho, alto)
        return [150, 60]; // Ajusta el tamaño según necesites
      },
    };

    const imageModule = new ImageModule(imageOpts);

    // Crear instancia de docxtemplater CON módulo de imágenes
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "", // Reemplazar valores null con string vacío
      modules: [imageModule],
    });

    // Preparar datos para el documento
    const docData = {
      cliente: data.cliente || "",
      direccion: data.direccion || "",
      cargo_departamento: data.cargo_departamento || "",
      fecha_instalacion: data.fecha_instalacion || "",
      responsable_centro_salud: data.responsable_centro_salud || "",
      firma_responsable_centro: data.firma_responsable_centro || "",
      responsable_drager: data.responsable_drager || "",
      firma_responsable_drager: data.firma_responsable_drager || "",
      productos: data.productos || [],
      asistentes: data.asistentes || [],
      // Agregar cualquier otro campo personalizado
      ...data.campos_extra,
    };

    // Renderizar el documento con los datos
    doc.render(docData);

    // Generar el buffer del documento
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return buf;
  } catch (error) {
    console.error("Error al generar documento Word:", error);
    if (error.properties && error.properties.errors) {
      console.error("Detalles del error:", JSON.stringify(error.properties.errors, null, 2));
    }
    throw error;
  }
};
