import { describe, expect, it } from "vitest";

import { tailorCv } from "../src/applications/tailor";
import { scoreJob } from "../src/match/score";
import { parseGetOnBoard } from "../src/sources/getonbrd";
import { parseLinkedin } from "../src/sources/linkedin";
import { parseTecnoempleo } from "../src/sources/tecnoempleo";
import { fitsPlace } from "../src/sources/text";

const cv = `
Desarrollo ETL con Python y PostgreSQL.
Dashboards en Power BI y DAX.
Despliegues en AWS con Docker.
Interfaces con TypeScript, React y Next.js.
`.trim();

describe("scoreJob", () => {
  it("marca aplicar cuando el anuncio coincide con el CV", () => {
    const result = scoreJob(
      cv,
      "Buscamos a alguien con Python, PostgreSQL, Power BI y AWS para un pipeline ETL en remoto. Experiencia construyendo modelos y paneles, más de ciento ochenta caracteres para que la ficha sea completa y se pueda puntuar de verdad.",
      "full",
    );
    expect(result.recommendation).toBe("aplicar");
    expect(result.met).toEqual(expect.arrayContaining(["python", "postgresql", "power bi", "aws"]));
  });

  it("señala Databricks como hueco y no lo inventa en el CV", () => {
    const result = scoreJob(
      cv,
      "Hace falta Databricks en producción junto con Python y PostgreSQL para el lago. El texto sigue hasta pasar el mínimo de caracteres del anuncio completo y poder calcular el encaje.",
      "full",
    );
    expect(result.gap).toContain("databricks");
    expect(result.recommendation).not.toBe("aplicar");
  });

  it("no puntúa una ficha parcial", () => {
    const result = scoreJob(cv, "Solo título", "partial");
    expect(result.recommendation).toBeNull();
    expect(result.met).toEqual([]);
  });
});

describe("fitsPlace", () => {
  it("acepta remoto en cualquier sitio y presencial en Valencia", () => {
    expect(
      fitsPlace({ location: "Madrid", title: "Data", body: "", modality: "remoto" }),
    ).toBe(true);
    expect(
      fitsPlace({
        location: "Catarroja",
        title: "Analista",
        body: "",
        modality: "hibrido",
      }),
    ).toBe(true);
    expect(
      fitsPlace({ location: "Madrid", title: "Analista", body: "", modality: "presencial" }),
    ).toBe(false);
  });
});

describe("parsers", () => {
  it("lee una oferta de Tecnoempleo", () => {
    const jobs = parseTecnoempleo(`
      <item>
        <title><![CDATA[Desarrollador Python]]></title>
        <link><![CDATA[https://www.tecnoempleo.com/python/rf-1]]></link>
        <description><![CDATA[<b>Empresa:</b> Vertx <br /><b>Provincia:</b> 100% En remoto <br />Python y PostgreSQL para un equipo.]]></description>
      </item>
    `);
    expect(jobs[0]?.company).toContain("Vertx");
    expect(jobs[0]?.modality).toBe("remoto");
  });

  it("lee una ficha pública de LinkedIn", () => {
    const jobs = parseLinkedin(`
      <div class="job-search-card" data-entity-urn="urn:li:jobPosting:99">
        <h3 class="base-search-card__title">Python Developer</h3>
        <h4 class="base-search-card__subtitle">Acme</h4>
        <span class="job-search-card__location">Valencia, Spain</span>
      </div>
    `);
    expect(jobs[0]?.url).toBe("https://www.linkedin.com/jobs/view/99");
    expect(jobs[0]?.location).toContain("Valencia");
  });

  it("se queda con las remotas de Get on Board", () => {
    const jobs = parseGetOnBoard({
      data: [
        {
          id: "a",
          attributes: {
            title: "Data",
            description: "Python remoto",
            remote_modality: "fully_remote",
            countries: ["Remote"],
          },
          links: { public_url: "https://www.getonbrd.com/jobs/data" },
        },
        {
          id: "b",
          attributes: { title: "Oficina", remote_modality: "hybrid", countries: ["Chile"] },
          links: { public_url: "https://www.getonbrd.com/jobs/oficina" },
        },
      ],
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.title).toBe("Data");
  });
});

describe("tailorCv", () => {
  it("usa frases del CV y no añade Databricks", () => {
    const result = tailorCv(
      cv,
      "Data engineer",
      "Necesitamos Python, PostgreSQL y Power BI para ETL. El anuncio es largo a propósito para superar el mínimo de texto y generar un CV a medida con las frases que ya existen.",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cv.toLowerCase()).toContain("python");
      expect(result.cv.toLowerCase()).not.toContain("databricks");
    }
  });
});
