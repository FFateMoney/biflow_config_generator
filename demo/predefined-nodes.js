window.PREDEFINED_NODES = [
  {
    name: "对齐FASTQ",
    tool: "bwa",
    input_dir: {},
    output_dir: "",
    log_dir: "",
    params: { threads: 4 }
  },
  {
    name: "变异检测",
    tool: "gatk",
    input_dir: {
      reference: 1,
      gatk: "gatk"
    },
    output_dir: "",
    log_dir: "",
    params: { mode: "haplotypecaller" }
  },
  {
    name: "质量控制",
    tool: "fastqc",
    input_dir: {},
    output_dir: "",
    log_dir: "",
    params: { min_quality: 20 }
  }
];
