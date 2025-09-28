window.PREDEFINED_NODES = [
  {
    "tool": "vcftools",
    "subcommand": "filter",
    "input_dir": {
      "vcf": "/RUN_DOCKER/input/vcf/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz"
    },
    "output_dir": "/RUN_DOCKER/output/results/03_PostProcessing/01_VcfFilter",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "vcftools_path": "/opt/conda/bin/vcftools"
    }
  },
  {
    "tool": "plink",
    "subcommand": "plink",
    "input_dir": {
      "vcf": "/RUN_DOCKER/output/results/03_PostProcessing/01_VcfFilter/ALL.variant.combined.GT.SNP.flt.filtered.vcf.recode.vcf.gz"
    },
    "output_dir": "/RUN_DOCKER/output/results/03_PostProcessing/02_Plink",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "plink_path": "/opt/conda/bin/plink",
      "geno": 0.01,
      "maf": 0.05,
      "hwe": 1e-06,
      "chr-set": 1
    }
  },
  {
    "tool": "hapmap",
    "subcommand": "vcf2hapmap",
    "input_dir": {
      "vcf": "/RUN_DOCKER/output/results/03_PostProcessing/01_VcfFilter/ALL.variant.combined.GT.SNP.flt.filtered.vcf.recode.vcf.gz"
    },
    "output_dir": "/RUN_DOCKER/output/results/03_PostProcessing/03_Hapmap",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "perl_path": "/usr/bin/perl",
      "script_path": "/PAPipe/03_shipeiqi/config/vcf2HapMap.pl"
    }
  },
  {
    "tool": "bwa",
    "subcommand": "index",
    "input_dir": {
      "reference": "/RUN_DOCKER/input/ref/cow.chr1.fa"
    },
    "output_dir": "/RUN_DOCKER/output/results/01_ReadMapping/01_Indexing",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "bwa_path": "/opt/conda/bin/bwa",
      "threads": 20,
      "reference": "/RUN_DOCKER/input/ref/cow.chr1.fa",
      "prefix": "ref"
    }
  },
  {
    "tool": "bwa",
    "subcommand": "mem",
    "input_dir": {
      "base": "/RUN_DOCKER/input/TrimmedData_repaired"
    },
    "output_dir": "/RUN_DOCKER/output/results/01_ReadMapping/02_Mapping",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "bwa_path": "/opt/conda/bin/bwa",
      "threads": 4,
      "index_prefix": "/RUN_DOCKER/output/results/01_ReadMapping/01_Indexing/ref",
      "platform": "ILLUMINA",
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "samtools",
    "subcommand": "sort",
    "input_dir": {
      "input_sam": "/RUN_DOCKER/output/results/01_ReadMapping/02_Mapping"
    },
    "output_dir": "/RUN_DOCKER/output/results/01_ReadMapping/02_Mapping",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "samtools_path": "/opt/conda/bin/samtools",
      "threads": 4,
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "picard",
    "subcommand": "mark_duplicates",
    "input_dir": {
      "input_bam": "/RUN_DOCKER/output/results/01_ReadMapping/02_Mapping"
    },
    "output_dir": "/RUN_DOCKER/output/results/01_ReadMapping/03_Dedup",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "java_path": "/opt/conda/bin/java",
      "picard_path": "/opt/conda/pkgs/picard-2.27.5-hdfd78af_0/share/picard-2.27.5-0/picard.jar",
      "memory": 4,
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "picard",
    "subcommand": "add_read_groups",
    "input_dir": {
      "input_bam": "/RUN_DOCKER/output/results/01_ReadMapping/03_Dedup"
    },
    "output_dir": "/RUN_DOCKER/output/results/01_ReadMapping/03_Dedup",
    "log_dir": "/RUN_DOCKER/output/logs",
    "params": {
      "java_path": "/opt/conda/bin/java",
      "picard_path": "/opt/conda/pkgs/picard-2.27.5-hdfd78af_0/share/picard-2.27.5-0/picard.jar",
      "memory": 4,
      "platform": "ILLUMINA",
      "platform_unit": "UNIT1",
      "breeds": ["Angus", "Hanwoo", "Holstein", "Jersey", "Simmental"],
      "samples": ["1", "2", "3", "4", "5"]
    }
  },
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": {
      "fastq": "/home/wu/RUN_DOCKER/data/input"
    },
    "output_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_Before_Trimming",
    "params": {
      "fastqc_path": "/home/wu/FastQC/fastqc",
      "threads": 4,
      "flag": 0,
      "file_pattern": "*.fastq*"
    }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_Before_Trimming",
    "output_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_Before_Trimming",
    "params": {
      "multiqc_path": "multiqc"
    }
  },
  {
    "tool": "trim_galore",
    "subcommand": "trim_galore",
    "input_dir": {
      "fastq": "/home/wu/RUN_DOCKER/data/input"
    },
    "output_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/TrimmedData",
    "params": {
      "trim_galore_path": "/home/wu/TrimGalore-0.6.10/trim_galore",
      "cores": 4,
      "additional_params": "",
      "paired_pattern": "*_1.*"
    }
  },
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": {
      "trimmed_data": "/home/wu/RUN_DOCKER/out1/00_ReadQC/TrimmedData"
    },
    "output_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_After_Trimming",
    "params": {
      "fastqc_path": "/home/wu/FastQC/fastqc",
      "threads": 8,
      "flag": 1,
      "file_pattern": "*_val_*.fq.gz"
    }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_After_Trimming",
    "output_dir": "/home/wu/RUN_DOCKER/out1/00_ReadQC/QC_Report_After_Trimming",
    "params": {
      "multiqc_path": "multiqc"
    }
  },
  {
    "tool": "samtools",
    "subcommand": "faidx",
    "input_dir": {
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/input/ref",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "samtools_path": "samtools",
      "reference": "cow.chr1.fa",
      "tool_path": "samtools"
    }
  },
  {
    "tool": "picard",
    "subcommand": "create_sequence_dictionary",
    "input_dir": {
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/input/ref",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "samtools",
    "subcommand": "local_realignment",
    "input_dir": {
      "bam": "/work/output/01"
    },
    "output_dir": "/work/output/01",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "tool_path": "samtools",
      "th": "5"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "haplotype_caller",
    "input_dir": {
      "bam": "/work/output/01",
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "java_path": "java",
      "memory": "20",
      "tool_path": "gatk",
      "th": "5",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "combine_gvcfs",
    "input_dir": {
      "reference": "/work/input/ref",
      "gvcf": "/work/output/02"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "java_path": "java",
      "memory": "20",
      "vcf_prefix": "test",
      "tool_path": "gatk",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "genotyping",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "java_path": "java",
      "memory": "20",
      "tool_path": "gatk",
      "vcf_prefix": "test",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "variant_selection",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "variant_filtering",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10",
      "filter_expression": "default"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "select_variants",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02"
    },
    "output_dir": "/work/output/02",
    "log_dir": "/work/log/variant_calling",
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10"
    }
  }
];

